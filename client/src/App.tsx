import { useState } from 'react'

const split = (str: string): string => {
  console.log(str.indexOf('\n'))
  console.log(str.indexOf('\r'))
  const key = str.split('\n').filter(str => str).join('')
  console.log(key)
  return key
//  console.log(key.toString())
//  return key.split('\n')
}

function App () {
  const [key, setKey] = useState<string>('')
  const get = () => {
    fetch('http://localhost:4001/api/pubKey', {
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (res) => {
        const key: { publicKey: string } = await res.json()
        sessionStorage.setItem('publicKey', key.publicKey as any)
        console.log(key.publicKey)
        setKey(key.publicKey)
      })
  }

  const getText = () => {
    fetch('http://localhost:4001/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
//      body: JSON.stringify({ publicKey: split(sessionStorage.getItem('publicKey') as string) }),
      body: JSON.stringify({ publicKey:sessionStorage.getItem('publicKey') }),
    })
      .then(async (res) => {
        console.log(await res.json())
      })
  }
  return (
    <>
      { key }
      <button onClick={ get }>getPubKey</button>
      <button onClick={ getText }>getText</button>
      <button onClick={ () => split(sessionStorage.getItem('publicKey') as string) }>logKey</button>
    </>
  )
}

export default App
