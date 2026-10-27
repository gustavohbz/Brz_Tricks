# Requested changes
- [x] Rename the app to Brauza Skate Co. across pages, announcements, metadata, installable-app name and documentation, preserving existing browser data.
- [x] Retire legacy subscription signup automation and billing access; free account setup/schedule save and reload verified, documentation updated. Historical billing schema remains deprecated and inaccessible because destructive schema removal is blocked by platform policy.
- [x] Add a full-width clickable advertising banner (temporary destination: Plans; advertiser URL not provided).
- [x] Add a notification bell beside the profile control, with read state.
- [x] Repair managed Google sign-in and verify installed dependencies and OAuth initiation.
- [ ] Complete Google account consent and sign-in: requires the user's Google interaction in the hosted preview.
- [ ] Fix Google sign-in when the app is hosted on Vercel: the Vercel domain is not a trusted OAuth return address, so the flow cannot finish there. Needs the user's Vercel URL to confirm.
- [x] Remove all subscription/monthly-billing surfaces: plans page dropped, every account saves the schedule and setup free, banner repointed to /treinos, trial copy removed everywhere. Verified: /planos 404s, menu has no plan item, profile save/reload works.
- [x] Add "Vídeos recomendados" section with a YouTube preview, placed below Curiosidades & dicas on the home page and at the footer of the cronograma on /treinos.
