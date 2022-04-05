export async function getTopAlbums(username) {
    console.log("albums")
    console.log(process.env)
    const url = `http://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${username}&api_key=${process.env.API_KEY}&format=json`
    const res = await fetch(url)
    console.log("here")
    console.log(res)
    return res
  }
  