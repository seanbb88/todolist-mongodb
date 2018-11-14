import React, { Component } from "react";
import axios from 'axios'; 

class App extends Component {
  state = {
    data: [], 
    id: 0, 
    message: null, 
    intervalIsSet: false, 
    idToDelete: null, 
    idToUpdate: null, 
    objectToUpdate: null
  }; 

  //when component mounts, first thing it does is fetch all existing data in our db
  //then we incoporate a polling logic so that we can easily see if our db has changed and implement those changes into our ui
  componentDidMount(){
    this.getDataFromDb(); 
    if(!this.state.intervalIsSet){
      let interval = setInterval(this.getDataFromDb, 1000); 
      this.setState({ intervalIsSet: interval })
    }
  }

  //never let a process live forever
  //always kill a process evertime we are done using it??? Im not sure why though
  componentWillUnmount(){
    if (this.state.intervalIsSet){
      clearInterval(this.state.intervalIsSet); 
      this.setState({ intervalIsSet: null }); 
    }
  }

  //in the front end we use the id key of our data object
  //in order to identify which we want to update or delete
  //we will use the object id assigned by mongodb to modify database entries

  getDataFromDb = () => {
    fetch("/api/getData")
      .then(data => data.json())
      .then(res => this.setState({ data: res.data }))
  }

  //our put method that uses our backend api to create new quary into our database+
  putDataToDb = message => {
    let currentIds = this.state.data.map(data => data.id); 
    let idToBeAdded = 0; 
    while (currentIds.includes(idToBeAdded)){
      ++idToBeAdded; 
    }

    axios.post("/api/putData", {
      id: idToBeAdded, 
      message: message
    })
  }

  //our delete method that uses our backend api to remove existing database info
  deleteFromDb = idToDelete => {
    let objIdToDelete = null; 
    this.state.data.forEach(data => {
      if (data.id === idToDelete) {
        objIdToDelete = data._id; 
      }
    }); 

    axios.delete("/api/deleteData", {
      data: {
        id: objIdToDelete
      }
    })
  }; 

  //update method that uses backend api to overwrite existing database info
  updateDb = (idToUpdate, updateToApply) => {
    let objIdToUpdate = null; 
    this.state.data.forEach(data => {
      if (data.id === idToUpdate){
        objIdToUpdate = data._id; 
      }
    })

    axios.post("/api/updateData", {
      id: objIdToUpdate, 
      update: { message: updateToApply}
    })
  }; 

  //here is our UI 
  render() {
    const { data } = this.state; 
    return (
      <div>
        <ul>
          {data.length <= 0
            ? "NO DB ENTRIES YET"
            : data.map(dat => (
                <li style={{ padding: "10px" }} key={data.message}>
                  <span style={{ color: "gray" }}> id: </span> {dat.id} <br />
                  <span style={{ color: "gray" }}> data: </span>
                  {dat.message}
                </li>
              ))}
        </ul>
        <div style={{ padding: "10px" }}>
          <input
            type="text"
            onChange={e => this.setState({ message: e.target.value })}
            placeholder="add something in the database"
            style={{ width: "200px" }}
          />
          <button onClick={() => this.putDataToDB(this.state.message)}>
            ADD
          </button>
        </div>
        <div style={{ padding: "10px" }}>
          <input
            type="text"
            style={{ width: "200px" }}
            onChange={e => this.setState({ idToDelete: e.target.value })}
            placeholder="put id of item to delete here"
          />
          <button onClick={() => this.deleteFromDB(this.state.idToDelete)}>
            DELETE
          </button>
        </div>
        <div style={{ padding: "10px" }}>
          <input
            type="text"
            style={{ width: "200px" }}
            onChange={e => this.setState({ idToUpdate: e.target.value })}
            placeholder="id of item to update here"
          />
          <input
            type="text"
            style={{ width: "200px" }}
            onChange={e => this.setState({ updateToApply: e.target.value })}
            placeholder="put new value of the item here"
          />
          <button
            onClick={() =>
              this.updateDB(this.state.idToUpdate, this.state.updateToApply)
            }
          >
            UPDATE
          </button>
        </div>
      </div>
    );
  }
}

export default App;