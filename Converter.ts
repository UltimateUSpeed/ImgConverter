/*! *****************************************************************************
Copyright (c) 2024 USpeed
https://github.com/UltimateUSpeed

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
****************************************************************************** */

/**
 * Convertisseur d'image d'un format à un autre.
 *  - `readFile()` : chargement des données du fichier
 *  - `loadImage()` : création d'une image HTML pour y placer les données du fichier fourni
 *  - `renderToCanvas()` : rendu de l'image HTML sur un canevas pour permettre une convertion dans le format souhaité
 *  - `startDownload()` : lancement du téléchargement
 * @copyright USpeed
 */
class Converter
{
  /**
   * Lancement du traitement.
   * @param {string} inputFileId l'identifiant du champ `<input type="file" />` depuis lequel il faut lire le fichier fourni
   * @param {string} formatChoiceId l'identifiant du champ `<select />` de choix du format final
   */
  static process(inputFileId: string, formatChoiceId: string): void
  {
    const stq: typeof Converter = Converter;
    const inputElt: HTMLInputElement = document.getElementById(inputFileId) as HTMLInputElement;
    if ((inputElt != null) && (inputElt.files != null) && (inputElt.files.length > 0))
    {
      // Récupération du format choisi par l'utilisateur
      const knownFormats: string[] = [ "jpeg", "png", "gif", "webp" ];
      const select: HTMLSelectElement = document.getElementById(formatChoiceId) as HTMLSelectElement;
      const tmpFormat: string = (select != null) ? (""+select.value).toLowerCase() : "";
      const format: string = (knownFormats.indexOf(tmpFormat) > -1) ? tmpFormat : knownFormats[0];

      // Lecture du fichier
      const file: File = inputElt.files[0];
      stq.readFile(file, function(dataUrl: string)
      {
        // Chargement du contenu du fichier dans une `<img />`
        stq.loadImage(dataUrl, function(img: HTMLImageElement)
        {
          stq.renderToCanvas(img, format, function(dataUrl: string)
          {
            // Découpage selon le ".", puis ajout de l'extension
            const filename: string[] = ((file.name != null) ? (""+file.name) : "").split(".");
            // filenameParts.pop();
            if (filename.length == 0) { filename.push("image"); }
            filename.push(format);
            console.log("Filename: ", filename);
            console.log("Data: ", dataUrl);
            stq.startDownload(dataUrl, filename.join("."));
          });
        });
      });
    }
  }

  /**
   * Chargement du fichier fourni pour afficher l'image dans le `<img />` souhaité.
   * @param {string} inputFileId l'identifiant du champ `<input type="file" />` depuis lequel il faut lire le fichier fourni
   * @param {string} imgPreviewId l'identifiant de l'image `<img />` de destination
   */
  static preview(inputFileId: string, imgPreviewId: string): void
  {
    const stq: typeof Converter = Converter;
    const imgElt: HTMLImageElement = document.getElementById(imgPreviewId) as HTMLImageElement;
    if (imgElt != null)
    {
      imgElt.style.display = "none";
      const inputElt: HTMLInputElement = document.getElementById(inputFileId) as HTMLInputElement;
      if ((inputElt != null) && (inputElt.files != null) && (inputElt.files.length > 0))
      {
        // Lecture du fichier
        const file: File = inputElt.files[0];
        stq.readFile(file, function(dataUrl: string)
        {
          imgElt.src = dataUrl;
          imgElt.style.display = "inline-block";
        });
      }
    }
  }

  /**
   * Chargement du contenu du fichier fourni puis lancement de la conversion et du téléchargement.
   * @param {File} file le fichier à lire
   * @param {Function} cb la fonction de traitement quand le fichier est chargé qui prend, en paramètre, les données du fichier sous forme d'URL
   */
  static readFile(file: File, cb: (dataUrl: string)=>void): void
  {
    if ((typeof(cb) == "function") && (file != null) && (file instanceof File))
    {
      const reader: FileReader = new FileReader();
      reader.onload = function() { cb(reader.result as string); };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Convertion du fichier en image.
   * @param {string} dataURL les données de l'image sous forme d'URL.
   * @param {Function} cb la fonction de traitement quand l'image est chargée qui prend, en paramètre, cette image
   */
  static loadImage(dataURL: string, cb: (img: HTMLImageElement)=>void): void
  {
    if (typeof(cb) == "function")
    {
      const img: HTMLImageElement = new Image();
      img.onload = function() { cb(img); };
      img.src = dataURL;
    }
  }

  /**
   * Rendu de l'image fournie sur un canevas puis convertion au format attendu.
   * @param {HTMLImageElement} img l'image à convertir
   * @param {string} format le format de destination (*jpeg, png, ...*)
   * @param {Function} cb la fonction de traitement quand l'image est convertie qui prend, en paramètre, les données URL de l'image finale
   */
  static renderToCanvas(img: HTMLImageElement, format: string, cb: (dataUrl: string)=>void): void
  {
    if ((img != null) && (img instanceof HTMLImageElement) && (format != null) && (typeof(cb) == "function"))
    {
      // Création d'un canevas pour le rendu
      const canvas: HTMLCanvasElement      = document.createElement("canvas");
      const ctx: CanvasRenderingContext2D  = canvas.getContext("2d") as CanvasRenderingContext2D;

      // Dimensions et rendu
      canvas.width  = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Convertion
      const data = canvas.toDataURL("image/"+format);
      cb(data);
    }
  }

  /**
   * Lancement du téléchargement du fichier fourni.
   * @param {string} dataUrl les données du fichier au format URL
   * @param {string} name nom du fichier final
   */
  static startDownload(dataUrl: string, name: string): void
  {
    const anchor: HTMLAnchorElement = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = name;
    anchor.click();
    anchor.remove();
  }
};
