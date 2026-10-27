<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## App rules
- Preserve existing browser-storage identifiers during branding changes so saved profiles, login history, setup and notification state remain available.
- Advertising campaign content and notification announcements live in a shared browser-safe data module so destinations and messages have one source.
- Notification read state is browser-local and is not an account inbox; avoid adding private messages to this public announcement list.
- Google sign-in uses the generated Lovable OAuth helper and returns to the public sign-in page; navigate to training only after the account session is available.
- Account creation is delegated to Google only; there is no email/password registration page or form, so avoid adding password auth flows unless the user asks for them.
- Account persistence uses profiles only, with no subscription dependency; preserve Google profile creation without billing records so free account saving stays independent of legacy billing structures.
- Remembered login is a browser-local navigation preference only, never authentication; profile controls derive from the actual session, saved local identity, and that preference to avoid treating a blank auto-generated identity as a returning account.
- Prebundle shared Radix UI and OAuth dependencies in Vite's initial optimization pass to prevent late discovery from mixing React runtime generations in an open preview; preserve the config package's built-in React deduplication.
