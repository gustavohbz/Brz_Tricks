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
- Advertising campaign content and notification announcements live in a shared browser-safe data module so destinations and messages have one source.
- Notification read state is browser-local and is not an account inbox; avoid adding private messages to this public announcement list.
- Google sign-in uses the generated Lovable OAuth helper and returns to the public sign-in page; navigate to training only after the account session is available.
