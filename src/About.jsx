import { Button } from '@mantine/core'
import React from 'react'
import { useNavigate } from 'react-router-dom'

function About() {

    const navigate = useNavigate()

  return (
    <div>
        <Button onClick={() => {
            navigate("/")
        }}>Back to home page</Button>
    </div>
  )
}

export default About