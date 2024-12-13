ALTER TABLE
    posts DROP CONSTRAINT posts_fk_video;

ALTER TABLE
    posts DROP COLUMN video_id;

DROP TABLE IF EXISTS temp_videos;

DROP TABLE IF EXISTS videos;