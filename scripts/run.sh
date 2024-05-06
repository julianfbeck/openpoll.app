#!/bin/bash
set -e

# Set the directory of the database in a variable
DB_PATH=/data/db.sqlite3

# Function to check if Litestream should be used
use_litestream=false

# Parsing command-line arguments
for arg in "$@"
do
    case $arg in
        --use-litestream)
        use_litestream=true
        shift # Remove --use-litestream from processing
        ;;
        *)
        shift # Remove generic argument from processing
        ;;
    esac
done

# Conditional execution of Litestream commands
if [ "$use_litestream" = true ] ; then
    # Restore the database if it does not already exist.
    if [ ! -f $DB_PATH ]; then
        echo "No database found, restoring from replica if exists"
        litestream restore -if-replica-exists $DB_PATH
    else
        echo "Database already exists, skipping restore"
    fi

    litestream wal $DB_PATH
    litestream generations $DB_PATH
    # Run litestream with your app as the subprocess.
    exec litestream replicate -exec "node ./dist/server/entry.mjs"
else
    # Run your app without Litestream
    exec node ./dist/server/entry.mjs
fi
