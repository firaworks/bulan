ALTER TABLE
	bulan.videos CHANGE format title varchar(255) DEFAULT "Гарчиггүй" NULL;

ALTER TABLE
	bulan.videos
MODIFY
	COLUMN title varchar(255) DEFAULT "Гарчиггүй" NULL;