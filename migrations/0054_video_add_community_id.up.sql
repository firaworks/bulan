ALTER TABLE
	videos
ADD
	COLUMN `community_id` binary(12) DEFAULT NULL
AFTER
	height;