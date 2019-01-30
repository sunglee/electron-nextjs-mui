import { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/styles";

import "../mui/bootstrap";

const useStyles = makeStyles({
  button: {
    padding: "1rem",
    margin: "1rem"
  }
});

export default function Index() {
  const classes = useStyles();
  const [state, setState] = useState({
    input: "",
    message: null
  });

  useEffect(() => {
    // start listening the channel message
    global.ipcRenderer.on("message", handleMessage);

    return () => {
      // stop listening the channel message
      global.ipcRenderer.removeListener("message", handleMessage);
    };
  });

  const handleMessage = (event, message) => {
    // receive a message from the main process and save it in the local state
    setState({ message });
  };

  const handleChange = event => {
    setState({ input: event.target.value });
    global.ipcRenderer.send("setStoreKeyVal", "input", event.target.value);
  };

  const handleSubmit = event => {
    event.preventDefault();
    global.ipcRenderer.send("message", state.input);
    setState({ message: null });
  };

  return (
    <div>
      <h1>Hello Electron!</h1>
      <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Porro quaerat facilis nesciunt, nisi error unde minima expedita sed odio non recusandae facere delectus velit accusantium repellendus maiores dicta quidem. Magnam!</p>

      {state.message && <p>{state.message}</p>}

      <form onSubmit={handleSubmit}>
        <input type="text" onChange={handleChange} />
      </form>
      <Button className={classes.button} variant="contained" color="primary">
        Hello World
      </Button>
    </div>
  );
}
