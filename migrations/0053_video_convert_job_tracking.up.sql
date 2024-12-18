ALTER TABLE
	videos
ADD
	COLUMN `job_id` varchar(255)
AFTER
	height;

ALTER TABLE
	videos
ADD
	COLUMN `job_started_at` datetime
AFTER
	job_id;

ALTER TABLE
	videos
ADD
	COLUMN `job_completed_at` datetime
AFTER
	job_started_at;