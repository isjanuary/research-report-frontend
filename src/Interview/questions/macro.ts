export async function macroMicro() {
  const p1 = new Promise(resolve => {
    console.log('promise 1')
    resolve(null)
  })

  const p2 = new Promise(resolve => {
    console.log('promise 2')
    resolve(null)
  })

  console.log('console log 1')

  setTimeout(() => {
    console.log('settimeout 1')
  }, 0)

  // setImmediate(() => {
  //   console.log('setimmediate 1')
  // })

  Promise.resolve()
    .then(() => {
      console.log('promise then 1')
    })
    .then(() => {
      console.log('promise then 2')
    })

  console.log('console log 2')

  const asyncF = async () => {
    console.log('async function start')
    await Promise.resolve()
    console.log('async function end')
  }

  await asyncF()

  // process.nextTick(() => {
  //   console.log('nexttick 1')
  // })

  setTimeout(() => {
    console.log('settimeout 2')
  }, 0)

  p2.then(() => {
    console.log('promise 2 then')
  })

  p1.then(() => {
    console.log('promise 1 then')
  })

  console.log('console log 3')

}