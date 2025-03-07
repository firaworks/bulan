package server

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/discuitnet/discuit/internal/httperr"
	"github.com/discuitnet/discuit/internal/uid"
)

// /api/video/status/:videoID [GET]
func (s *Server) getVideoStatus(w *responseWriter, r *request) error {
	if !r.loggedIn {
		return errNotLoggedIn
	}

	videoID, err := strToID(r.muxVar("videoID"))
	if err != nil {
		return err
	}

	// Query the videos table
	row := s.db.QueryRowContext(r.ctx, `
		SELECT 
			v.id,
			v.job_id, 
			v.job_started_at,
			v.job_completed_at,
			v.title,
			v.cmaf_path IS NOT NULL AS is_complete
		FROM videos v
		WHERE v.id = ?
	`, videoID)

	var (
		id             uid.ID
		jobID          sql.NullString
		jobStartedAt   *sql.NullTime
		jobCompletedAt *sql.NullTime
		title          string
		isComplete     bool
		postURL        string
	)

	if err := row.Scan(&id, &jobID, &jobStartedAt, &jobCompletedAt, &title, &isComplete); err != nil {
		if err == sql.ErrNoRows {
			return httperr.NewNotFound("video-not-found", "Video not found")
		}
		return err
	}

	if !isComplete {
		// If user doesn't have permission to access this video, deny
		if isUserOwner, err := isVideoOwner(r.ctx, s.db, *r.viewer, videoID); err != nil {
			return err
		} else if !isUserOwner {
			return httperr.NewForbidden("not-owner", "You don't have permission to view this video's status")
		}
	}

	// Calculate progress
	var status string
	var progress int

	if isComplete {
		status = "COMPLETE"
		progress = 99
		if postURL, err = getPostUrlByVideoID(r.ctx, s.db, videoID); err != nil {
			return err
		} else {
			progress = 100
		}

	} else if !jobID.Valid {
		status = "QUEUED"
		progress = 0
	} else {
		// Check AWS MediaConvert for job status
		if jobCompletedAt != nil && jobCompletedAt.Valid {
			status = "COMPLETE"
			progress = 99
		} else {
			// Job is in progress
			status = "PROCESSING"
			// If we have no other info, make a time-based guess
			progress = calculateProgressEstimate(jobStartedAt)
		}
	}

	response := struct {
		ID       uid.ID `json:"id"`
		Status   string `json:"status"`
		Progress int    `json:"progress"`
		Title    string `json:"title"`
		PostURL  string `json:"postUrl"`
	}{
		ID:       id,
		Status:   status,
		Progress: progress,
		Title:    title,
		PostURL:  postURL,
	}

	return w.writeJSON(response)
}

// isVideoOwner checks if the user is the owner of the video
func isVideoOwner(ctx context.Context, db *sql.DB, userID uid.ID, videoID uid.ID) (bool, error) {
	var count int
	query := `
		SELECT COUNT(*) 
		FROM temp_videos
		WHERE user_id = ? AND video_id = ?
	`
	err := db.QueryRowContext(ctx, query, userID, videoID).Scan(&count)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// getPostUrlByVideoID
func getPostUrlByVideoID(ctx context.Context, db *sql.DB, videoID uid.ID) (string, error) {
	query := `
		SELECT p.public_id, c.name
			FROM posts p
			LEFT JOIN communities c ON p.community_id = c.id 
			WHERE p.video_id = ?
	`
	var (
		postId        string
		communityName string
	)
	err := db.QueryRowContext(ctx, query, videoID).Scan(&postId, &communityName)
	if err != nil {
		return "", err
	}
	relativeUrl := fmt.Sprintf("/%s/post/%s", communityName, postId)
	return relativeUrl, nil
}

// calculateProgressEstimate makes a time-based estimate of video processing progress
func calculateProgressEstimate(startTime *sql.NullTime) int {
	if startTime == nil || !startTime.Valid {
		return 10 // Default progress if no start time
	}

	// Calculate how long the job has been running
	elapsedSeconds := int(float64(time.Since(startTime.Time).Seconds()))

	// Estimate based on typical processing times
	// Assume most videos take about 3-5 minutes to process
	const estimatedTotalSeconds = 300 // 5 minutes

	if elapsedSeconds >= estimatedTotalSeconds {
		return 95 // Cap at 95% until we know it's complete
	}

	// Linear progress from 5% to 95%
	progress := 5 + int(float64(elapsedSeconds)/float64(estimatedTotalSeconds)*90)

	return progress
}
