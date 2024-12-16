package videos

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"path/filepath"
	"strconv"

	msql "github.com/discuitnet/discuit/internal/sql"
	"github.com/discuitnet/discuit/internal/uid"
)

var (
	ErrVideoNotFound          = errors.New("video not found")
	ErrBadURL                 = errors.New("bad video request url")
	ErrVideoFormatUnsupported = errors.New("video format not supported")
	ErrVideoFitUnsupported    = errors.New("invalid video fit")
)

// VideoSize represents the size of an image.
type VideoSize struct {
	Width, Height int
}

// Zero returns true if either the width or the height is 0.
func (s VideoSize) Zero() bool {
	return s.Width == 0 || s.Height == 0
}

// String returns, for example, "400" if width and height are both 400px, and
// "400x600" if width is 400px and height is 600px.
func (s VideoSize) String() string {
	if s.Width == s.Height {
		return strconv.Itoa(s.Width)
	}
	return strconv.Itoa(s.Width) + "x" + strconv.Itoa(s.Height)
}

// MarshalText implements encoding.TextMarshaler interface. Output is the same
// as String method.
func (s VideoSize) MarshalText() ([]byte, error) {
	return []byte(s.String()), nil
}

func SaveVideoToDB(ctx context.Context, tx *sql.Tx, id uid.ID, s3path string, w, h int) (uid.ID, error) {
	var err error
	query, args := msql.BuildInsertQuery("videos", []msql.ColumnValue{
		{Name: "id", Value: id},
		{Name: "s3_path", Value: s3path},
		{Name: "format", Value: filepath.Ext(s3path)},
		{Name: "thumbnail_id", Value: 0},
		{Name: "width", Value: w},
		{Name: "height", Value: h},
	})
	if _, err = tx.ExecContext(ctx, query, args...); err != nil {
		return uid.ID{}, err
	}
	return id, nil
}

func DeleteVideosTx(ctx context.Context, tx *sql.Tx, db *sql.DB, videos ...uid.ID) error {
	records, err := GetVideoRecords(ctx, db, videos...)
	if err != nil {
		return err
	}

	for _, record := range records {
		// remove from s3 here
		fmt.Printf("trying to remove video: %s", record.ID)
		// if err := record.store().delete(record); err != nil {
		// 	return err
		// }
	}

	args := make([]any, len(videos))
	for i := range videos {
		args[i] = videos[i]
	}

	_, err = tx.ExecContext(ctx, fmt.Sprintf("DELETE FROM videos WHERE id IN %s", msql.InClauseQuestionMarks(len(videos))), args...)
	return err
}
