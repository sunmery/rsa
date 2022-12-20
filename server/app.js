const express = require('express')
const app = express()
const crypto = require('node:crypto')
const cors = require('cors')

app.use(express.json({ type: 'application/json' }));
// The `generateKeyPairSync` method accepts two arguments: generateKeyPairSync方法接受两个参数:
// 1. The type ok keys we want, which in this case is "rsa" 我们想要的ok键，在这个例子中是rsa
// 2. An object with the properties of the key 具有键属性的对象
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  // The standard secure default length for RSA keys is 2048 bits RSA密钥的标准安全默认长度是2048位
  modulusLength: 2048,
})

console.log(
  'publicKey:',
  // 公钥使用pkcs1模式填充
  publicKey.export({
    type: 'pkcs1',
    format: 'pem',
  }),
)
console.log(
  'privateKey:',
  // 私钥使用pkcs1模式填充
  privateKey.export({
    type: 'pkcs1',
    format: 'pem',
  }))

// This is the data we want to encrypt 要加密的数据
const data = 'my secret data'

// 公钥加密
const encryptedData = crypto.publicEncrypt(
  {
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, // RSA填充是为了和公钥等长
    oaepHash: 'sha256', // 使用SHA256加密
  },
  // We convert the data string to a buffer using `Buffer.from` 使用' buffer .from '将数据字符串转换为缓冲区
  Buffer.from(data),
)

// The encrypted data is in the form of bytes, so we print it in base64 format
// so that it's displayed in a more readable form
// 加密的数据是字节的形式，所以我们以base64格式打印它以更易读的形式显示出来
console.log('encypted data: ', encryptedData.toString('base64'))

const decryptedData = crypto.privateDecrypt(
  {
    key: privateKey,
    // In order to decrypt the data, we need to specify the
    // same hashing function and padding scheme that we used to
    // encrypt the data in the previous step
    // 为了解密数据，我们需要指定相同的哈希函数和填充方案，我们使用加密上一步的数据
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256',
  },
  encryptedData,
)

// The decrypted data is of the Buffer type, which we can convert to a
// string to reveal the original data
// 解密的数据是Buffer类型的，我们可以将其转换为字符串显示原始数据
console.log('decrypted data: ', decryptedData.toString())

// Create some sample data that we want to sign
// 创建需要签名的样本数据
const verifiableData = 'this need to be verified'

// The signature method takes the data we want to sign, the
// hashing algorithm, and the padding scheme, and generates
// a signature in the form of bytes
// signature签名方法获取我们想要签名的数据
// 哈希算法和填充方案，并生成RSA_PKCS
// 字节形式的签名
const signature = crypto.sign('sha256', Buffer.from(verifiableData), {
  key: privateKey,
  padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
})

// 输出签名
console.log('签名: ', signature.toString('base64'))

// To verify the data, we provide the same hashing algorithm and
// padding scheme we provided to generate the signature, along
// with the signature itself, the data that we want to
// verify against the signature, and the public key
// 为了验证数据，我们提供了相同的哈希算法和
// 我们提供的用于生成签名的填充方案
// 与签名本身，我们想要的数据
// 验证签名和公钥
//const isVerified = crypto.verify(
//  'sha256', // 加密的算法
//  Buffer.from(verifiableData), // 签名
//  {
//    key: publicKey, // 公钥
//    padding: crypto.constants.RSA_PKCS1_PSS_PADDING, // 填充公钥的算法
//  },
//  signature,
//)

// isVerified should be `true` if the signature is valid
// 如果签名有效，isVerified应该为true
//console.log('signature verified: ', isVerified)
app.use(cors())
app.get('/api/pubKey', async (req, res) => {
  res.send({
    publicKey: await publicKey.export({
      type: 'pkcs1',
      format: 'pem',
    }),
  })
})
app.post('/api/profile', async (req, res) => {
  console.log('/api/profile')
//  console.log('publicKey',req.body.publicKey)
  const isVerified = crypto.verify(
    'sha256', // 加密的算法
    Buffer.from(verifiableData), // 签名
    {
      key: await req.body.publicKey, // 公钥
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING, // 填充公钥的算法
    },
    signature,
  )
  res.send({
    isVerified,
  })
})
app.listen(4001, () => {
  console.log(1)
})
