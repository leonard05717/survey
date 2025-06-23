import { useEffect, useState } from 'react'
import './App.css'
import { createClient } from '@supabase/supabase-js'
import { ActionIcon, Button, LoadingOverlay, Modal, TextInput } from '@mantine/core';
import { Icon123, IconEdit, IconHome, IconTrash } from '@tabler/icons-react';
import About from './About';
import { useNavigate } from 'react-router-dom';

const supabaseUrl = 'https://kdpnxxcxvpczvrohriyd.supabase.co'
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkcG54eGN4dnBjenZyb2hyaXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjE3MjAsImV4cCI6MjA2NjIzNzcyMH0.kglD4_6NBOgNc7t6RQQW1irdmnvTZGM8l2fqGx4HS6Q";
const supabase = createClient(supabaseUrl, key)

function App() {

  const navigate = useNavigate()

  const [names, setnames] = useState([
    {
      firstname: "",
      lastname: ""
    }
  ])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [firstname, setfirstname] = useState("")
  const [lastname, setlastname] = useState("")
  const [userId, setUserId] = useState()

  async function submit() {

    setLoading(true)
    const firstname = document.getElementById("fname").value
    const lastname = document.getElementById("lname").value

    if(!firstname || !lastname) {
      setLoading(false)
      return alert("All field is required")
    }

    const { error } = await supabase.from("users").insert({
      firstname: firstname,
      lastname: lastname
    })

    if(error) {
      console.log(error.message)
    }else{
      document.getElementById("fname").value = ""
      document.getElementById("lname").value = ""
      loadData()
      console.log("Success!")
    }
    setLoading(false)
    

  }

  async function loadData() {
    const { error, data } = await supabase.from("users").select();
    setnames(data)
  }

  async function deleteUser(id) {
    setLoading(true)
    await supabase.from("users").delete().eq("id", id)
    await loadData()
    console.log("Delete Success")
    setLoading(false)
  }

  async function saveChangesEvent() {
    console.log("Loading..")
    await supabase.from("users").update({
      firstname: firstname,
      lastname: lastname
    }).eq("id", userId);
    loadData()
    setIsModalOpen(false)
    console.log("Edit Success")
  }


  useEffect(() => {

    loadData()

    const sectionSubscription = supabase
    .channel("realtime:users")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "users" },
      (payload) => {
        if (payload.eventType === "INSERT") {
          setnames((prev) => [
            payload.new,
            ...prev,
          ]);
        } else if (payload.eventType === "UPDATE") {
          setnames((prev) =>
            prev.map((item) =>
              item.id === payload.new.id
                ? (payload.new)
                : item
            )
          );
        } else if (payload.eventType === "DELETE") {
          setnames((prev) =>
            prev.filter((item) => item.id !== payload.old.id)
          );
        }
      }
    )
    .subscribe();
    
    return () => {
      supabase.removeChannel(sectionSubscription)
    }
  }, [])


  return (
    <div className='main-container'>

      <Modal title="Edit User" opened={isModalOpen} onClose={() => {
        setIsModalOpen(false)
      }}>
        <TextInput value={firstname} onChange={(e) => {
          setfirstname(e.target.value)
        }} id="edit-fname" label="First Name" placeholder='Enter First Name' />
        <TextInput value={lastname} onChange={(e) => {
          setlastname(e.target.value)
        }} id="edit-lname" label="Last Name" placeholder='Enter Last Name' />
        <Button onClick={saveChangesEvent} mt={10}>Save Changes</Button>
      </Modal>

      <div className='input-container'>
        <input id='fname' className='input' type='text' placeholder='First Name' />
        <input id='lname' className='input' type='text' placeholder='Last Name' />
      </div>
      <Button loading={loading} size='xs' onClick={submit}>Submit User</Button>
      <div clasName='card'>

        {names.map((name) => {
          return (
            <div className='item'>
              <div>{name.firstname} {name.lastname}</div>
              <div>
              <ActionIcon color="blue" onClick={() => {
                
                setfirstname(name.firstname)
                setlastname(name.lastname)
                setUserId(name.id)

                setIsModalOpen(true)
              }}>
                <IconEdit size={17} />
              </ActionIcon>
              <ActionIcon color="red" onClick={() => {
                deleteUser(name.id)
              }}>
                <IconTrash size={17} />
              </ActionIcon>
              </div>
            </div>
            )
          })}
          <Button onClick={() => {
            navigate("about")
          }}>Go to about page</Button>
      </div>
    </div>
  )
}

export default App
