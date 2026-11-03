# Release checklist (do this every time)

1. Add a new entry at the TOP of `UPDATE_LOG` in `app.js`. Its `v` must equal `APP_VERSION`.
2. Bump `APP_VERSION` in `app.js` and `CACHE` in `sw.js` to the same new version (for example soy-v34).
3. Add the same entry to `UPDATE-LOG.txt` in the docs folder.
4. If a new SQL upgrade was needed, add `upgrade-vNN.sql` and say in the entry that it must be run.
5. Run `node --check app.js` and the browser tests.
6. Zip the app and copy it to the outputs folder.
7. Commit with the attribution lines (Co-Authored-By and Claude-Session).
