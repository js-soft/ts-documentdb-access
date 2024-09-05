BASEDIR=$(dirname "$0")

docker compose -p database-tests -f $BASEDIR/compose.yml up -d ferret
