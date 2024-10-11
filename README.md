# Prototype only

vtube-stream-service consist of multiple backend services that supports the following
    -   user service
    -   live stream creation
    -   live chat
    -   gift systems
    -   promotions

Upon live streaming, users connects to it via websocket
it allows them to interact to their idols thru live group chat
they can send gifts during stream as well all of them in real time.

# user
    we will assume, that any user can stream. but they can only either do a stream or join a stream 1 at a time.
    signup
    login
    subscribe
# wallet
    tokens, 1 token = 1 USD
        -   add tokens
        -   get token
# gift
    By default, we have 5 gifts for now
    Candy - 1 token
    Donut - 5 token
    Robot - 10 token    
    Ring - 100 token
# stream
    1 user can either
        -   do the stream
        -   join a stream

    video streaming wont be handled here, this service only supports the following
        1. during stream, below actions are allowed
            -   send message to streamer
            -   send gifts to streamer

    Websocket Actions
        - connect
        - disconnect
        - joinStream
        - sendMessage
        - sendGift

will use typescript/express for user, wallet, gift service (these are all http api), and also will use postgreSQL
stream service will be written in go (both api and websocket), this will also DynamoDB
everything will be dockerize of course

# to run locally

docker-compose up