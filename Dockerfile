# Upstream's classic image is built FROM scratch: two binaries and nothing
# else. Two things StartOS needs are missing, so this layer adds them and
# changes nothing else (the daemons in startos/main.ts name the binary to run):
#  - a CMD, because `start-cli s9pk pack` exports the image through
#    `docker create`, which refuses an image with no command;
#  - /etc/passwd and /etc/group, because StartOS resolves the user a daemon
#    runs as from the container's passwd file, and a missing file aborts exec.
FROM rustdesk/rustdesk-server:1.1.16
COPY docker/etc/passwd docker/etc/group /etc/
CMD ["hbbs"]
