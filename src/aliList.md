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
- Post /request/send/interested/:userId
- Post /request/send/ingored/:userId
- Post /request/review/accepted/:requestId
- Post /request/review/rejected/:requestId


- Get /user/connection
- get /user/request/received
- get /user/feed - gets you the profile of other users on  platforms

Status :  ignore,interested,accepted,rejected
