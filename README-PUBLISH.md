# Soukaina's password-protected birthday gift

This is the protected copy of the gift. The photos and videos in `media/` are encrypted; the website asks for the password before it can decrypt and display them. The password is **not** stored in this folder.

## Put it online for free with GitHub Pages

1. Sign in to GitHub and create a **public** repository, for example `soukaina-birthday-gift`.
2. Upload the contents of this folder to the repository's main branch. Upload every `.enc` file in `media/`; do not upload the original media folder from the unprotected gift.
3. In the repository, open **Settings → Pages** and choose **Deploy from a branch**, branch **main**, folder **/(root)**, then save.
4. GitHub will show the gift's web address in that Pages settings screen after it publishes.
5. Send Soukaina that address and the password in a separate private message.

The repository and encrypted files are public, but the original photos and videos are not present in it. Only someone with the password can decrypt the media in the page. Keep the password private and do not reuse it elsewhere. The birthday page also asks search engines not to index it, but that setting is not access control—the password is what protects the media.

## Important

- This folder is a static website and must be served over HTTPS for browser encryption to work. GitHub Pages provides HTTPS.
- The original, unprotected website is in the sibling `soukaina-birthday` folder. Do not upload that folder to a public repository.
- The ciphertext can be downloaded by anyone who can access the public repository. Without the password, it should be computationally infeasible to recover the original media.
- Keep a separate backup of the originals and password. If you lose the password, the encrypted copies cannot be recovered.
