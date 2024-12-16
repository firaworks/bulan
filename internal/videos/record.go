package videos

import (
	"context"
	"database/sql"
	"time"

	msql "github.com/discuitnet/discuit/internal/sql"
	"github.com/discuitnet/discuit/internal/uid"
)

// VideoRecord is a database row of an video item.
//
// Table name: videos.
type VideoRecord struct {
	db *sql.DB

	ID          uid.ID         `json:"id"`
	S3Path      string         `json:"s3Path"`
	CmafPath    sql.NullString `json:"cmafPath"`
	Format      string         `json:"format"`
	ThumbnailID int            `json:"thumbnailID"`
	Width       int            `json:"width"`
	Height      int            `json:"height"`
	CreatedAt   time.Time      `json:"createdAt"`
	DeletedAt   *time.Time     `json:"deletedAt"`
}

// VideoRecordColumns returns the list of columns of the videos table. Use this
// function in conjuction with VideoRecordScanDestinations when selecting SQL
// joins.
func VideoRecordColumns() []string {
	return []string{
		"videos.id",
		"videos.s3_path",
		"videos.cmaf_path",
		"videos.format",
		"videos.thumbnail_id",
		"videos.width",
		"videos.height",
		"videos.created_at",
		"videos.deleted_at",
	}
}

var videoRecordSelectColumns = VideoRecordColumns()

// ScanDestinations returns a slice of pointers that sql.Rows.Scan can populate.
// The pointers match the column names returned by VideoRecordSelectColumns.
func (r *VideoRecord) ScanDestinations() []any {
	return []any{
		&r.ID,
		&r.S3Path,
		&r.CmafPath,
		&r.Format,
		&r.ThumbnailID,
		&r.Width,
		&r.Height,
		&r.CreatedAt,
		&r.DeletedAt,
	}
}

// GetVideoRecords returns a slice of video records. If no videos were found it
// returns ErrVideoNotFound.
func GetVideoRecords(ctx context.Context, db *sql.DB, ids ...uid.ID) ([]*VideoRecord, error) {
	query := msql.BuildSelectQuery("videos", videoRecordSelectColumns, nil, "WHERE id IN "+msql.InClauseQuestionMarks(len(ids)))

	args := make([]any, len(ids))
	for i := range ids {
		args[i] = ids[i]
	}

	rows, err := db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}

	records, err := scanVideoRecords(db, rows)
	if err != nil {
		return nil, err
	}
	if len(records) == 0 {
		return nil, ErrVideoNotFound
	}
	return records, nil
}

// GetVideoRecords returns a video record. If no video was found it returns
// ErrVideoNotFound.
func GetVideoRecord(ctx context.Context, db *sql.DB, id uid.ID) (*VideoRecord, error) {
	records, err := GetVideoRecords(ctx, db, id)
	if err != nil {
		return nil, err
	}
	return records[0], nil
}

func scanVideoRecords(db *sql.DB, rows *sql.Rows) ([]*VideoRecord, error) {
	defer rows.Close()

	var records []*VideoRecord
	for rows.Next() {
		r := &VideoRecord{db: db}
		err := rows.Scan(r.ScanDestinations()...)
		if err != nil {
			return nil, err
		}
		records = append(records, r)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return records, nil
}

func (r *VideoRecord) Video() *Video {
	m := NewVideo()
	*m.ID = r.ID
	*m.S3path = r.S3Path
	*m.CmafPath = r.CmafPath
	*m.Format = r.Format
	*m.ThumbnailID = r.ThumbnailID
	return m
}

// Video is an video that's to be sent to the client.
// It is to be derived from a VideoRecord.
type Video struct {
	ID           *uid.ID         `json:"id"`
	S3path       *string         `json:"s3Path"`
	CmafPath     *sql.NullString `json:"cmafPath"`
	Format       *string         `json:"format"`
	ThumbnailID  *int            `json:"thumbnailID"`
	Width        *int            `json:"width"`
	Height       *int            `json:"height"`
	ThumbnailURL *string         `json:"thumbnailURL"`
}

// NewVideo returns an Video with all pointer fields allocated and set to zero
// values.
func NewVideo() *Video {
	m := &Video{}
	m.ID = new(uid.ID)
	m.S3path = new(string)
	m.CmafPath = new(sql.NullString)
	m.Format = new(string)
	m.ThumbnailID = new(int)
	m.Width = new(int)
	m.Height = new(int)
	return m
}

// VideoColumns returns a list of columns of the videos table (not all of them)
// for when selecting using and outer join. Use Video.ScanDestinations in
// conjunction with this function.
func VideoColumns(tableAlias string) []string {
	return []string{
		tableAlias + ".id",
		tableAlias + ".s3_path",
		tableAlias + ".cmaf_path",
		tableAlias + ".format",
		tableAlias + ".thumbnail_id",
		tableAlias + ".width",
		tableAlias + ".height",
	}

}

func (m *Video) ScanDestinations() []any {
	return []any{
		&m.ID,
		&m.S3path,
		&m.CmafPath,
		&m.Format,
		&m.ThumbnailID,
		&m.Width,
		&m.Height,
	}
}
