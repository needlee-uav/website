# Run command
gunicorn --worker-tmp-dir /dev/shm --worker-class eventlet -w 1 app:app