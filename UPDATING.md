# Updating the upstream version

Upstream is the `rustdesk/rustdesk-server` Docker image, the "classic" variant built
`FROM scratch` with the `hbbs` and `hbbr` binaries and nothing else. The package builds its
own image `FROM` it (see `Dockerfile`) to add a `CMD` and an `/etc/passwd`, both of which
StartOS needs and the upstream image lacks. The pin lives in the `Dockerfile`, not in
`startos/manifest/index.ts`.

## Determining the upstream version

Releases are tagged `X.Y.Z` on the [`rustdesk/rustdesk-server`](https://github.com/rustdesk/rustdesk-server)
repository, and Docker Hub carries the same tag for `amd64`, `arm64` and `armv7`:

```bash
gh release view -R rustdesk/rustdesk-server --json tagName -q .tagName
curl -s 'https://hub.docker.com/v2/repositories/rustdesk/rustdesk-server/tags?page_size=20' \
  | jq -r '.results[] | "\(.name) \([.images[].architecture]|join(","))"'
```

Confirm the tag carries both `amd64` and `arm64` before pinning it. Ignore the
`rustdesk/rustdesk-server-s6` image and the client (`rustdesk/rustdesk`) releases, which are
versioned separately.

## Applying the bump

1. Set the tag on the `FROM rustdesk/rustdesk-server:` line in `Dockerfile`.
2. Set `version` in `startos/versions/current.ts` to `X.Y.Z:0` and summarize upstream's release
   notes in `releaseNotes`.
3. Check the three facts the package relies on still hold: `hbbs` loads or generates
   `id_ed25519` / `id_ed25519.pub` in its working directory by default, `hbbr -k -` loads that
   same pair, and `ALWAYS_USE_RELAY` / `-r` still exist (`startos/main.ts` names each).
   `docs/environment-variables.md` in the upstream repo is the reference.
4. The server's SQLite peer database is created and migrated by `hbbs`; upstream does not
   document a downgrade path, so `down: IMPOSSIBLE` stays.
