"use client"

import { Box, Button, Stack, TextField, Typography, Modal, IconButton } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info';
import { useState } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
    },
  ])
  const [message, setMessage] = useState('')
  const [open, setOpen] = useState(false)

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const sendMessage = async () => {
    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])

    const response = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    }).then(async (res) => {
      if (!res.body) return
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let result = ''

      return reader.read().then(function processText({ done, value }): Promise<string> {
        if (done) {
          return Promise.resolve(result)
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
        return reader.read().then(processText)
      })
    })
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      className="text-white"
      sx={{
        background: 'linear-gradient(135deg, #d1e3f8 0%, #e3f2fd 100%)',
      }}
    >
      {/* Removed top-left content */}
      <Stack
        direction={'column'}
        width="500px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <Typography variant="h4" className="text-center text-primary-color">
          Rate My Professor Assistant
        </Typography>
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
          <Typography variant="body1" className="text-center text-gray-600 mb-4">
            Ask me anything about your professors and classes!
          </Typography>
          <IconButton onClick={handleOpen} aria-label="how to use">
            <InfoIcon />
          </IconButton>
        </Stack>
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'primary.main'
                    : 'secondary.main'
                }
                color="white"
                borderRadius={16}
                p={3}
                className="bg-primary-color text-white rounded-lg p-4"
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border border-gray-300 rounded-lg p-2"
            InputProps={{
              endAdornment: (
                <Button
                  variant="contained"
                  onClick={sendMessage}
                  className="bg-primary-color text-white rounded-lg p-2"
                  sx={{ width: '80px', height: '36px' }}
                >
                  Send
                </Button>
              ),
            }}
          />
        </Stack>
      </Stack>
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="40%"
          left="40%"
          width={400}
          bgcolor="background.paper"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          className="rounded-lg bg-white"
        >
          <Typography sx={{ mt: 2 }} className="text-black">
            1. Type your question in the message box.
          </Typography>
          <Typography sx={{ mt: 2 }} className="text-black">
            2. Click the &quot;Send&quot; button to submit your question.
          </Typography>
          <Typography sx={{ mt: 2 }} className="text-black">
            3. The assistant will respond to your question.
          </Typography>
        </Box>
      </Modal>
    </Box>
  )
}