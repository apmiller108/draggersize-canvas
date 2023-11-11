# Draggersize

![Screenshot from 2023-11-11 16-03-52](https://github.com/apmiller108/draggersize-canvas/assets/14243155/82694091-528b-4bc0-87db-109a1dd7360a)

### What does it do?
- It's an HTML canvas
- Select an image from your device to use as a background
- Draw rectangles and resize them
- Delete rectangles you no longer want on the canvas

### Instructions
- Clone the repo
- `yarn install`
- `yarn start`
- visit `localhost:8080` in your browser

#### Don't have node?
If you have docker installed, from the project directory run

```shell
docker run -it -p 8080:8080 -v "$PWD":/app node bash
```

...and follow the above instructions.
