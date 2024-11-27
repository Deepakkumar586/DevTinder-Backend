# DevTinder API

# authRouter

- Post /signup
- Post /login
- post /logout

# ProfileRouter

- get /profile/view
- Patch /profile/edit
- Patch /profile/forgotPassword

# ConnectionRequestRouter

<!-- ignored and interested -->
- Post /request/send/:status/:userId

<!-- Accepted and Rejected -->
- Post /request/review/:status/:requestId

- Get /user/connection
- get /user/request/received
- get /user/feed - gets you the profile of other users on platforms

Status : ignore,interested,accepted,rejected
