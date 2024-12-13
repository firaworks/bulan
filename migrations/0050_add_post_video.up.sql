CREATE TABLE IF NOT EXISTS videos (
	id binary (12) NOT NULL,
	s3_path varchar (128) NOT NULL,
	cmaf_path varchar (128),
	format varchar (32) NOT NULL,
	thumbnail_id tinyint(4) NOT NULL,
	created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(),
	deleted_at datetime,
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS temp_videos (
	id bigint UNSIGNED NOT NULL AUTO_INCREMENT,
	user_id binary (12) NOT NULL,
	video_id binary (12) NOT NULL,
	created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(),
	PRIMARY KEY (id),
	FOREIGN KEY (user_id) REFERENCES users (id),
	FOREIGN KEY (video_id) REFERENCES videos (id),
	UNIQUE (video_id),
	INDEX (created_at)
);

ALTER TABLE
	posts
ADD
	COLUMN video_id binary (12)
AFTER
	image;

ALTER TABLE
	posts
ADD
	CONSTRAINT posts_fk_video FOREIGN KEY (video_id) REFERENCES videos(id);