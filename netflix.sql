\echo 'Delete and recreate netflixdb db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE netflixdb;
CREATE DATABASE netflixdb;
\connect netflixdb

\i netflixdb.sql

\echo 'Delete and recreate netflixdb_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE netflixdb_test;
CREATE DATABASE netflixdb_test;
\connect netflixdb_test

\i netflixdb.sql