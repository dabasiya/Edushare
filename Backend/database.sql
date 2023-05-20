create table accounts(
	id integer auto_increment primary key, 
	username varchar(20) unique,
	password varchar(40),
	email varchar(30) unique
);

create table comments(
	Account_id integer,
	Video_id integer,
	comment varchar(200)
);

create table liked_videos(
	account_id integer,
	video_id integer
);

create table saved_videos(
	account_id integer,
	video_id integer
);

create table reported_videos (
	video_id integer primary key,
	count integer
);

create table tags (
	video_id integer primary_key,
	tags text
);

create table thumbnil (
	id integer primary key,
	type varchar(4)
);

create table videos (
	id integer auto_increment primary key,
	title varchar(100),
	video_views integer,
	likes integer,
	upload_date date,
	uploader_id integer,
	video_type varchar(5)
);

create table youtube_videos (
	video_id integer primary key,
	link varchar(11)
);