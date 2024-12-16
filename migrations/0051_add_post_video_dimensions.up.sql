ALTER TABLE
	videos
ADD
	COLUMN `width` int
AFTER
	thumbnail_id;

ALTER TABLE
	videos
ADD
	COLUMN `height` int
AFTER
	width;