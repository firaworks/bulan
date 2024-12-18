package server

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/mediaconvert"
	"github.com/aws/aws-sdk-go-v2/service/mediaconvert/types"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/discuitnet/discuit/core"
	"github.com/discuitnet/discuit/internal/httperr"
	"github.com/discuitnet/discuit/internal/uid"
	"github.com/h2non/filetype"
)

// /api/posts [POST]
func (s *Server) addPost(w *responseWriter, r *request) error {
	if !r.loggedIn {
		return errNotLoggedIn
	}

	if err := s.rateLimit(r, "add_post_1_"+r.viewer.String(), time.Second*10, 1); err != nil {
		return err
	}
	if err := s.rateLimit(r, "add_post_2_"+r.viewer.String(), time.Hour*24, 70); err != nil {
		return err
	}

	req := struct {
		PostType  core.PostType       `json:"type"`
		Title     string              `json:"title"`
		URL       string              `json:"url"`
		Body      string              `json:"body"`
		Community string              `json:"community"`
		UserGroup core.UserGroup      `json:"userGroup"`
		ImageId   string              `json:"imageId"`
		Images    []*core.ImageUpload `json:"images"`
		Video     *core.VideoRequest  `json:"video"`
	}{
		PostType:  core.PostTypeText,
		UserGroup: core.UserGroupNormal,
	}
	if err := r.unmarshalJSONBody(&req); err != nil {
		return err
	}

	// Disallow image post creation if image posts are disabled in config.
	if s.config.DisableImagePosts && req.PostType == core.PostTypeImage {
		return httperr.NewForbidden("no_image_posts", "Image posts are not allowed")
	}

	comm, err := core.GetCommunityByName(r.ctx, s.db, req.Community, nil)
	if err != nil {
		return err
	}

	var post *core.Post
	switch req.PostType {
	case core.PostTypeText:
		post, err = core.CreateTextPost(r.ctx, s.db, *r.viewer, comm.ID, req.Title, req.Body)
	case core.PostTypeImage:
		var images []*core.ImageUpload
		if req.Images != nil {
			images = req.Images
		} else {
			imageID, idErr := uid.FromString(req.ImageId)
			if idErr != nil {
				return httperr.NewBadRequest("invalid_image_id", "Invalid image ID.")
			}
			images = []*core.ImageUpload{
				{ImageID: imageID},
			}
		}
		if len(images) > s.config.MaxImagesPerPost {
			return httperr.NewBadRequest("too-many-images", "Maximum images count exceeded.")
		}
		post, err = core.CreateImagePost(r.ctx, s.db, *r.viewer, comm.ID, req.Title, images)
	case core.PostTypeLink:
		post, err = core.CreateLinkPost(r.ctx, s.db, *r.viewer, comm.ID, req.Title, req.URL)
	case core.PostTypeVideo:
		if req.Video != nil {
			if len(req.Video.S3Path) > 0 && len(req.Video.VideoID) > 0 {
				jobId, startedAt, err := s.callMediaConvertAWS(r.ctx, req.Video)
				if err != nil {
					return httperr.NewBadRequest("convert_start_failed", "Error while converting video.")
				}
				_, err = core.SaveMediaConvertJobStart(r.ctx, s.db, req.Video.VideoID, req.Title, comm.ID, jobId, startedAt, req.Video.ThumbnailID)
				if err != nil {
					return httperr.NewBadRequest("convert_start_unsaved", "Error while marking convert video.")
				}
				return w.writeJSON("success")
			} else {
				return httperr.NewBadRequest("invalid_video_id", "Invalid video ID.")
			}
		} else {
			return httperr.NewBadRequest("invalid_video_input", "Invalid video input.")
		}
		// post, err = core.CreateVideoPost(r.ctx, s.db, *r.viewer, comm.ID, req.Title, req.Video)
	default:
		return httperr.NewBadRequest("invalid_post_type", "Invalid post type.")
	}
	if err != nil {
		return err
	}

	if req.UserGroup != core.UserGroupNormal {
		if err := post.ChangeUserGroup(r.ctx, *r.viewer, req.UserGroup); err != nil {
			return err
		}
	}

	// +1 your own post.
	post.Vote(r.ctx, *r.viewer, true)
	return w.writeJSON(post)
}

// /api/posts/:postID [GET]
func (s *Server) getPost(w *responseWriter, r *request) error {
	postID := r.muxVar("postID") // public post id
	post, err := core.GetPost(r.ctx, s.db, nil, postID, r.viewer, true)
	if err != nil {
		return err
	}

	if _, err = post.GetComments(r.ctx, r.viewer, nil); err != nil {
		return err
	}

	if fetchCommunity := r.urlQueryParamsValue("fetchCommunity"); fetchCommunity == "" || fetchCommunity == "true" {
		comm, err := core.GetCommunityByID(r.ctx, s.db, post.CommunityID, r.viewer)
		if err != nil {
			return err
		}
		if err = comm.FetchRules(r.ctx); err != nil {
			return err
		}
		if err = comm.PopulateMods(r.ctx); err != nil {
			return err
		}
		post.Community = comm
	}

	return w.writeJSON(post)
}

// /api/posts/:postID [PUT]
func (s *Server) updatePost(w *responseWriter, r *request) error {
	postID := r.muxVar("postID") // public post id
	if !r.loggedIn {
		return errNotLoggedIn
	}

	if err := s.rateLimitUpdateContent(r, *r.viewer); err != nil {
		return err
	}

	post, err := core.GetPost(r.ctx, s.db, nil, postID, r.viewer, true)
	if err != nil {
		return err
	}

	query := r.urlQueryParams()
	action := query.Get("action")
	if action == "" {
		// Update post.
		var tpost core.Post
		if err = r.unmarshalJSONBody(&tpost); err != nil {
			return err
		}
		tpost.Title = strings.TrimSpace(tpost.Title)
		tpost.Body.String = strings.TrimSpace(tpost.Body.String)

		// override updatable fields
		needSaving := false
		if post.Type == core.PostTypeText && !post.DeletedContent {
			if post.Body != tpost.Body {
				needSaving = true
				post.Body = tpost.Body
			}
		}
		if post.Title != tpost.Title {
			needSaving = true
			post.Title = tpost.Title
		}

		if needSaving {
			if err = post.Save(r.ctx, *r.viewer); err != nil {
				return err
			}
		}
	} else {
		switch action {
		case "lock", "unlock":
			var as core.UserGroup
			if err = as.UnmarshalText([]byte(query.Get("lockAs"))); err != nil {
				return err
			}
			if action == "lock" {
				err = post.Lock(r.ctx, *r.viewer, as)
			} else {
				err = post.Unlock(r.ctx, *r.viewer)
			}
			if err != nil {
				return err
			}
		case "changeAsUser":
			var as core.UserGroup
			if err = as.UnmarshalText([]byte(query.Get("userGroup"))); err != nil {
				return err
			}
			if err = post.ChangeUserGroup(r.ctx, *r.viewer, as); err != nil {
				return err
			}
		case "pin", "unpin":
			siteWide := strings.ToLower(query.Get("siteWide")) == "true"
			if err = post.Pin(r.ctx, *r.viewer, siteWide, action == "unpin", false); err != nil {
				return err
			}
		default:
			return httperr.NewBadRequest("invalid_action", "Unsupported action.")
		}
	}

	return w.writeJSON(post)
}

// /api/posts/:postID [DELETE]
func (s *Server) deletePost(w *responseWriter, r *request) error {
	postID := r.muxVar("postID") // public post id
	if !r.loggedIn {
		return errNotLoggedIn
	}

	if err := s.rateLimitUpdateContent(r, *r.viewer); err != nil {
		return err
	}

	post, err := core.GetPost(r.ctx, s.db, nil, postID, r.viewer, true)
	if err != nil {
		return err
	}
	query := r.urlQueryParams()

	var as core.UserGroup
	if err = as.UnmarshalText([]byte(query.Get("deleteAs"))); err != nil {
		return err
	}
	deleteContent := false
	if dc := strings.ToLower(query.Get("deleteContent")); dc != "" {
		if dc == "true" {
			deleteContent = true
		} else if dc != "false" {
			return httperr.NewBadRequest("", "deleteContent must be a bool.")
		}
	}
	if err := post.Delete(r.ctx, *r.viewer, as, deleteContent, true); err != nil {
		return err
	}

	return w.writeJSON(post)
}

// /api/_postVote [ POST ]
func (s *Server) postVote(w *responseWriter, r *request) error {
	if !r.loggedIn {
		return errNotLoggedIn
	}

	if err := s.rateLimitVoting(r, *r.viewer); err != nil {
		return err
	}

	req := struct {
		PostID uid.ID `json:"postId"`
		Up     bool   `json:"up"`
	}{Up: true}
	if err := r.unmarshalJSONBody(&req); err != nil {
		return err
	}

	post, err := core.GetPost(r.ctx, s.db, &req.PostID, "", r.viewer, true)
	if err != nil {
		return err
	}

	if post.ViewerVoted.Bool {
		if req.Up == post.ViewerVotedUp.Bool {
			err = post.DeleteVote(r.ctx, *r.viewer)
		} else {
			err = post.ChangeVote(r.ctx, *r.viewer, req.Up)
		}
	} else {
		err = post.Vote(r.ctx, *r.viewer, req.Up)
	}
	if err != nil {
		return err
	}

	return w.writeJSON(post)
}

// /api/_uploadImage [ POST ]
func (s *Server) imageUpload(w *responseWriter, r *request) error {
	if s.config.DisableImagePosts {
		return httperr.NewForbidden("no_image_posts", "Image posts are not all allowed.")
	}
	if !r.loggedIn {
		return errNotLoggedIn
	}

	if err := s.rateLimit(r, "uploads_1_"+r.viewer.String(), time.Second*1, 5); err != nil {
		return err
	}
	if err := s.rateLimit(r, "uploads_2_"+r.viewer.String(), time.Hour*24, 80); err != nil {
		return err
	}

	r.req.Body = http.MaxBytesReader(w, r.req.Body, int64(s.config.MaxImageSize)) // limit max upload size
	if err := r.req.ParseMultipartForm(int64(s.config.MaxImageSize)); err != nil {
		return httperr.NewBadRequest("file_size_exceeded", "Max file size exceeded.")
	}

	file, _, err := r.req.FormFile("image")
	if err != nil {
		return err
	}
	defer file.Close()

	fileData, err := io.ReadAll(file)
	if err != nil {
		return err
	}

	image, err := core.SavePostImage(r.ctx, s.db, *r.viewer, fileData)
	if err != nil {
		return err
	}

	return w.writeJSON(image.Image())
}

// /api/_uploadVideo [ POST ]
func (s *Server) videoUpload(w *responseWriter, r *request) error {
	if s.config.DisableVideoPosts {
		return httperr.NewForbidden("no_video_posts", "Video posts are not all allowed.")
	}
	if !r.loggedIn {
		return errNotLoggedIn
	}

	if err := s.rateLimit(r, "uploads_1_"+r.viewer.String(), time.Second*1, 5); err != nil {
		return err
	}
	if err := s.rateLimit(r, "uploads_2_"+r.viewer.String(), time.Hour*24, 80); err != nil {
		return err
	}

	r.req.Body = http.MaxBytesReader(w, r.req.Body, int64(s.config.MaxVideoSize)) // limit max upload size
	if err := r.req.ParseMultipartForm(int64(s.config.MaxVideoSize)); err != nil {
		return httperr.NewBadRequest("file_size_exceeded", "Max file size exceeded.")
	}

	file, _, err := r.req.FormFile("video")
	if err != nil {
		return err
	}
	defer file.Close()

	// TODO: may be really get the dimensions here in the future.
	// this involves using ffmpeg or other heavy libs. avoided that for now.
	width := 1080
	height := 1920
	width, err = strconv.Atoi(r.req.PostFormValue("w"))
	if err != nil {
		return errors.New("unable to determine vidoe size")
	}
	height, err = strconv.Atoi(r.req.PostFormValue("h"))
	if err != nil || width == 0 || height == 0 {
		return errors.New("unable to determine vidoe size")
	}

	fileData, err := io.ReadAll(file)
	if err != nil {
		return err
	}

	isVid := filetype.IsVideo(fileData)
	if !isVid {
		return errors.New("unsupported video type")
	}
	id := uid.New()
	s3dir := "video/input"
	s3path, err := s.saveToAWS(r.ctx, fileData, s3dir, id.String())
	if err != nil {
		return err
	}
	video, err := core.SavePostVideo(r.ctx, s.db, *r.viewer, id, s3path, width, height)
	if err != nil {
		return err
	}
	return w.writeJSON(video.Video())
}

func (s *Server) saveToAWS(ctx context.Context, fileData []byte, s3dir, fname string) (string, error) {
	ft, _ := filetype.Match(fileData)
	// fileMeta := map[string]string{"Content-Type": ft.MIME.Value}
	filename := fname + "." + ft.Extension
	env := "dev/"
	if !s.config.IsDevelopment {
		env = ""
	}
	s3path := fmt.Sprintf("%s%s/%s", env, s3dir, filename)
	creds := aws.Credentials{
		AccessKeyID:     s.config.AwsAccessKeyId,
		SecretAccessKey: s.config.AwsSecretAccessKey,
	}
	credsProvider := credentials.StaticCredentialsProvider{
		Value: creds,
	}
	s3client := s3.NewFromConfig(aws.Config{
		Region:      s.config.AwsRegion,
		Credentials: credsProvider,
	})
	_, err := s3client.PutObject(ctx, &s3.PutObjectInput{
		// Metadata:    fileMeta,
		ContentType: aws.String(ft.MIME.Value),
		Bucket:      aws.String(s.config.AwsBucket),
		Key:         aws.String(s3path),
		Body:        bytes.NewReader(fileData),
	})
	return s3path, err
}

func (s *Server) callMediaConvertAWS(ctx context.Context, v *core.VideoRequest) (string, time.Time, error) {
	cfg := aws.Config{
		Region: s.config.AwsRegionMediaConvert,
		Credentials: credentials.StaticCredentialsProvider{
			Value: aws.Credentials{
				AccessKeyID:     s.config.AwsAccessKeyId,
				SecretAccessKey: s.config.AwsSecretAccessKey,
			},
		},
	}
	// check if job already started
	mcClient := mediaconvert.NewFromConfig(cfg)
	jobId, startedAt, err := core.FindJobIDbyS3Input(mcClient, v.VideoID.String())
	if err != nil {
		return "", time.Time{}, err
	}
	if jobId != "" {
		return jobId, startedAt, nil
	}

	var inputs []types.Input
	audioSelector := make(map[string]types.AudioSelector)
	audioSelector["Audio Selector 1"] = types.AudioSelector{
		DefaultSelection: "DEFAULT",
	}
	inputs = append(inputs, types.Input{
		FileInput:      aws.String(fmt.Sprintf("s3://%s/%s", s.config.AwsBucket, v.S3Path)),
		VideoSelector:  &types.VideoSelector{Rotate: types.InputRotateAuto},
		AudioSelectors: audioSelector,
		TimecodeSource: types.InputTimecodeSource(*aws.String("ZEROBASED")),
	})
	jobInput := &mediaconvert.CreateJobInput{
		Role:        aws.String(s.config.AwsMediaConvertRoleARN),
		JobTemplate: aws.String(s.config.AwsMediaConvertJobTemplate),
		Settings: &types.JobSettings{
			Inputs: inputs,
		},
	}
	// to track if job completes through transition to tomorrow
	jobStartedAt := time.Now().UTC()
	jobOutput, err := mcClient.CreateJob(context.Background(), jobInput)
	if err != nil {
		return "", time.Time{}, err
	}
	jobId = *jobOutput.Job.Id
	return jobId, jobStartedAt, nil
}
