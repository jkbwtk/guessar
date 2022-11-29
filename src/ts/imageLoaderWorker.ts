self.addEventListener('message', async (ev) => {
  const { data: url } = ev;

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const image = await createImageBitmap(blob);

    self.postMessage({ url, image }, [image]);
  } catch (err) {
    self.postMessage({ url, image: null });
  }
});
