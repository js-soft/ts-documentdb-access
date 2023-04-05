BASEDIR=$(dirname "$0")

docker compose -p database-tests -f $BASEDIR/docker-compose.yml up -d ferret sh
