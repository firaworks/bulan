ALTER TABLE bulan.videos CHANGE title format varchar(32) DEFAULT "mp4" NOT NULL;
ALTER TABLE bulan.videos MODIFY COLUMN format varchar(32) DEFAULT "mp4" NOT NULL;
