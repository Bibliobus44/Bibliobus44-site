const APPSCRIPT_URL = "https://script.google.com/macros/s/AKfycby90n7sIcY1mKisYngMJtaBEdXDjRD8zujQgVvNTx4LGTAH65kkL0HMcDsBcwaxMnD9fQ/exec";

function convertirUrlImageDrive(url) {
  if (!url) return "";

  const match = url.match(
    /https:\/\/drive\.google\.com\/uc\?export=view&id=([^&"'\\s]+)/
  );

  if (match) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
  }

  return url;
}

let editArticleId=null;
let editDraftId = null;
let autoSaveTimer = null;
let currentDraftId = null;
let hasUnsavedChanges = false;



// 🔐 LOGIN
async function login() {
  const password = document.getElementById("admin-password").value;

  try {
    const res = await fetch(APPSCRIPT_URL, {
      method: "POST",
      body: new URLSearchParams({
        action: "login",
        password: password
      })
    });

    const data = await res.json();

    if (data.success) {
      sessionStorage.setItem("adminPassword", password);

      document.getElementById("admin-panel").classList.remove("hidden");
      document.getElementById("login-box").style.display = "none";

      chargerArticlesAdmin();
    } else {
      alert("Mot de passe incorrect");
    }

  } catch (err) {
    console.error(err);
    alert("Erreur serveur");
  }
}


function setupEditor(bloc){

  setupDropZone(bloc);

  const textarea = bloc.querySelector(".bloc-texte");

  let startPos = 0;
  let endPos = 0;

  textarea.addEventListener("select", () => {
    startPos = textarea.selectionStart;
    endPos = textarea.selectionEnd;
  });

  textarea.addEventListener("keyup", () => {
    startPos = textarea.selectionStart;
    endPos = textarea.selectionEnd;
  });

  textarea.addEventListener("mouseup", () => {
    startPos = textarea.selectionStart;
    endPos = textarea.selectionEnd;
  });

  bloc.querySelector(".btn-bold").addEventListener("mousedown", function(e){

    e.preventDefault();

    const selected = textarea.value.substring(startPos,endPos);

    if(!selected) return;

    textarea.value =
      textarea.value.substring(0,startPos) +
      "<strong>" + selected + "</strong>" +
      textarea.value.substring(endPos);

  });

  bloc.querySelector(".btn-italic").addEventListener("mousedown", function(e){

    e.preventDefault();

    const selected = textarea.value.substring(startPos,endPos);

    if(!selected) return;

    textarea.value =
      textarea.value.substring(0,startPos) +
      "<em>" + selected + "</em>" +
      textarea.value.substring(endPos);

  });

}


function formatText(id, tag){

  const textarea = document.getElementById(id);

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  const selected = textarea.value.substring(start,end);

  if(!selected){
    alert("Sélectionnez un texte.");
    return;
  }

  textarea.value =
    textarea.value.substring(0,start) +
    `<${tag}>${selected}</${tag}>` +
    textarea.value.substring(end);

}


// ➕ BLOC 1 IMAGE
function ajouterBlocSimple(){

const bloc=document.createElement("div");
bloc.classList.add("bloc-admin");
bloc.draggable = true;
bloc.dataset.type="single";

bloc.innerHTML=`

<div class="bloc-header">
  <span class="drag-handle">☰</span>
  <strong>Bloc 1 image + texte</strong>
</div>

<label>Image</label>

<div class="image-picker">

    <input
        type="text"
        class="bloc-img"
        placeholder="Coller une URL d'image">

    <div class="drop-zone">
        🖼️ Glissez-déposez une image ici
    </div>
    <div class="image-preview"></div>
    <button
        type="button"
        class="remove-image"
        style="display:none;">
        🗑 Supprimer l'image
    </button> 

    <input
        type="file"
        class="image-file"
        accept="image/*"
        hidden>

</div>

<label>Position image</label>
<select class="bloc-img-position">
<option value="center">Centré</option>
<option value="left">Gauche</option>
<option value="right">Droite</option>
</select>

<label>Texte</label>

<div class="editor-toolbar">
  <button type="button" class="btn-bold">Gras</button>
  <button type="button" class="btn-italic">Italique</button>
</div>

<textarea class="bloc-texte"></textarea>

<button type="button" class="remove-bloc">Supprimer</button>
<hr>
`;

document.getElementById("article-blocs").appendChild(bloc);

setupEditor(bloc);

bloc.querySelector(".remove-bloc").addEventListener("click",()=>bloc.remove());

bloc.querySelectorAll(".choose-image").forEach(btn=>{

    btn.addEventListener("click",()=>{

        btn.nextElementSibling.click();

    });

});



}

document.getElementById("add-block-btn").addEventListener("click",ajouterBlocSimple);



// ➕ BLOC 2 IMAGES

function ajouterBlocDouble(){

const bloc=document.createElement("div");
bloc.classList.add("bloc-admin");
bloc.draggable = true;
bloc.dataset.type="double";

bloc.innerHTML=`

<div class="bloc-header">
  <span class="drag-handle">☰</span>
  <strong>Bloc 2 images</strong>
</div>

<label>Image 1</label>

<div class="image-picker">

    <input type="text" 
        class="bloc-img1" 
        placeholder="Coller une URL d'image">

    <div class="drop-zone">
        🖼️ Glissez-déposez une image ici
    </div>
    <div class="image-preview"></div>
    <button
        type="button"
        class="remove-image"
        style="display:none;">
        🗑 Supprimer l'image
    </button> 

    <input type="file"
        class="image-file"
        accept="image/*"
        hidden>

</div>

<label>Image 2</label>

<div class="image-picker">

    <input type="text" class="bloc-img2" placeholder="Coller une URL d'image">

    <div class="drop-zone">
        🖼️ Glissez-déposez une image ici
    </div>
    <div class="image-preview"></div>
    <button
        type="button"
        class="remove-image"
        style="display:none;">
        🗑 Supprimer l'image
    </button> 

    <input type="file"
           class="image-file"
           accept="image/*"
           hidden>

</div>

<label>Texte</label>

<div class="editor-toolbar">
  <button type="button" class="btn-bold">Gras</button>
  <button type="button" class="btn-italic">Italique</button>
</div>

<textarea class="bloc-texte"></textarea>

<button type="button" class="remove-bloc">Supprimer</button>
<hr>
`;

document.getElementById("article-blocs").appendChild(bloc);

setupEditor(bloc);

bloc.querySelector(".remove-bloc").addEventListener("click",()=>bloc.remove());

bloc.querySelectorAll(".choose-image").forEach(btn=>{

    btn.addEventListener("click",()=>{

        btn.nextElementSibling.click();

    });

});

}

document
.getElementById("add-block-2img-btn")
.addEventListener("click", ajouterBlocDouble);


document.getElementById("add-block-embed-btn").addEventListener("click",function(){

const bloc=document.createElement("div");

bloc.classList.add("bloc-admin");

bloc.dataset.type="embed";

bloc.innerHTML=`

<div class="bloc-header">

<span class="drag-handle">☰</span>

<strong>Bloc intégré</strong>

</div>

<label>Type</label>

<select class="embed-type">

<option value="youtube">YouTube</option>

<option value="iframe">Iframe (Google Maps, MyMaps...)</option>

</select>

<label>Lien ou iframe</label>

<textarea class="embed-code"></textarea>

<button type="button" class="remove-bloc">

Supprimer

</button>

<hr>

`;

document.getElementById("article-blocs").appendChild(bloc);

bloc.querySelector(".remove-bloc").addEventListener("click",()=>bloc.remove());

});

document.getElementById("add-block-video-btn").addEventListener("click",function(){

const bloc=document.createElement("div");

bloc.classList.add("bloc-admin");

bloc.dataset.type="video";

bloc.innerHTML=`

<div class="bloc-header">

<span class="drag-handle">☰</span>

<strong>Bloc vidéo</strong>

</div>

<label>Vidéo</label>

<div class="video-picker">

<input
type="text"
class="bloc-video"
placeholder="Coller une URL de vidéo (.mp4, .webm...)">

<div class="drop-zone-video">

🎥 Glissez-déposez une vidéo ici

</div>

<div class="video-preview"></div>

<button
type="button"
class="remove-video"
style="display:none;">

🗑 Supprimer la vidéo

</button>

</div>

<label>Texte</label>

<div class="editor-toolbar">

<button type="button" class="btn-bold">Gras</button>

<button type="button" class="btn-italic">Italique</button>

</div>

<textarea class="bloc-texte"></textarea>

<button type="button" class="remove-bloc">

Supprimer

</button>

<hr>

`;

document.getElementById("article-blocs").appendChild(bloc);

setupEditor(bloc);

bloc.querySelector(".remove-bloc").addEventListener("click",()=>bloc.remove());

});


function recupererArticle(){

    let intro = document.getElementById("article-intro").value;

    let structure = {
        intro: intro,
        blocs: []
    };

    let contenuFinal = "";

    if(intro){
        contenuFinal += `<p class="art-intro">${intro}</p>`;
    }

    let firstImage = "";

    const blocs = document.querySelectorAll("#article-blocs .bloc-admin");

    blocs.forEach((bloc, idx)=>{

        const type = bloc.dataset.type;

        // ===========================
        // BLOC 2 IMAGES
        // ===========================

        if(type==="double"){

            const texte = bloc.querySelector(".bloc-texte").value;

            const imageFinale1 = convertirUrlImageDrive(bloc.querySelector(".bloc-img1").value);
            const imageFinale2 = convertirUrlImageDrive(bloc.querySelector(".bloc-img2").value);

            structure.blocs.push({
                type:"double",
                image1:imageFinale1,
                image2:imageFinale2,
                texte:texte
            });

            if(idx===0 && imageFinale1){
                firstImage = imageFinale1;
            }

            contenuFinal += `<div class="bloc-2img">`;

            if(imageFinale1){
                contenuFinal += `<img class="bloc-2img-item" src="${imageFinale1}">`;
            }

            if(imageFinale2){
                contenuFinal += `<img class="bloc-2img-item" src="${imageFinale2}">`;
            }

            contenuFinal += `</div>`;

            if(texte){
                contenuFinal += `<div>${texte}</div>`;
            }

        }


        else if(type==="video"){

            const video = bloc.querySelector(".bloc-video").value;

            const texte = bloc.querySelector(".bloc-texte").value;

            structure.blocs.push({

                type:"video",

                video,

                texte

            });

    contenuFinal += `

<video controls class="article-video">

<source src="${video}">

</video>

`;

    if(texte){

        contenuFinal += `<div>${texte}</div>`;

    }

}

        // ===========================
        // BLOC YOUTUBE / IFRAME
        // ===========================

        else if(type==="embed"){

            const provider = bloc.querySelector(".embed-type").value;
            const code = bloc.querySelector(".embed-code").value;

            structure.blocs.push({
                type:"embed",
                provider:provider,
                code:code
            });

            if(provider==="youtube"){

                let id = code.trim();

                if(id.includes("youtu.be/")){
                    id = id.split("youtu.be/")[1];
                }

                if(id.includes("watch?v=")){
                    id = id.split("watch?v=")[1];
                }

                id = id.split("&")[0]; 

                contenuFinal += `
<div class="youtube-preview"
data-video="${id}">
<img src="https://img.youtube.com/vi/${id}/hqdefault.jpg">
<div class="play-btn">▶</div>
</div>
`;

            }else{

                contenuFinal += code;

            }

        }

        // ===========================
        // BLOC IMAGE SIMPLE
        // ===========================

        else{

            const texte = bloc.querySelector(".bloc-texte").value;

            const img = bloc.querySelector(".bloc-img").value;

            const position = bloc.querySelector(".bloc-img-position").value;

            const imageFinale = convertirUrlImageDrive(img);
            
            structure.blocs.push({
                type:"image",
                image:imageFinale,
                position:position,
                texte:texte
            });

            if(idx===0 && imageFinale){
                firstImage = imageFinale;
            }

            if(img){

                if(position==="right"){

                    contenuFinal += `<img class="bi-droite" src="${imageFinale}"><div>${texte}</div><div class="bf"></div>`;

                }

                else if(position==="left"){

                    contenuFinal += `<img class="bi-gauche" src="${imageFinale}"><div>${texte}</div><div class="bf"></div>`;

                }

                else{

                    contenuFinal += `<img class="bi-center" src="${imageFinale}"><div>${texte}</div>`;

                }

            }else{

                contenuFinal += `<div>${texte}</div>`;

            }

        }

    });

    return{
        firstImage,
        contenuFinal,
        structure
    };

}




// 📝 PUBLIER ARTICLE
document.getElementById("publish-article").addEventListener("click",async function(){

const title=document.getElementById("article-title").value;
const categorie = document.getElementById("article-categorie").value;

if(!title)
    return alert("Titre requis");

if(!categorie)
    return alert("Choisissez une catégorie.");

const {
    firstImage,
    contenuFinal,
    structure
} = recupererArticle();



const res=await fetch(APPSCRIPT_URL,{
method:"POST",
body:new URLSearchParams({
action:"publish",
password: sessionStorage.getItem("adminPassword"),
title,
categorie,
img:firstImage,
content:contenuFinal,
structure: JSON.stringify(structure)
})
});


const data=await res.json();

if(data.success){

    if(editDraftId !== null){

        await fetch(APPSCRIPT_URL,{

            method:"POST",

            body:new URLSearchParams({

                action:"deleteDraft",

                password:
                    sessionStorage.getItem(
                        "adminPassword"
                    ),

                id:editDraftId

            })

        });

        editDraftId = null;

    }

    alert("Article publié");

    resetForm();

    chargerArticlesAdmin();

    chargerBrouillons();

}

});


document.getElementById("save-draft")
.addEventListener("click", async function(e){

    const title =
        document.getElementById("article-title").value;

    const categorie =
        document.getElementById("article-categorie").value;

    const {
        firstImage,
        contenuFinal,
        structure
    } = recupererArticle();

    const res = await fetch(APPSCRIPT_URL,{

        method:"POST",

        body:new URLSearchParams({

            action:"draft",

            password:
                sessionStorage.getItem(
                    "adminPassword"
                ),

            title,
            categorie,
            img:firstImage,
            content:contenuFinal,
            structure:JSON.stringify(structure)

        })

    });

    const data = await res.json();

    if(data.success){

        alert("Brouillon enregistré !");

        resetForm();

        chargerBrouillons();

    }

})


// 💾 ENREGISTRER MODIFICATION
document.getElementById("save-edit").addEventListener("click", async function(){

const title=document.getElementById("article-title").value;
const categorie=document.getElementById("article-categorie").value;
const {
    firstImage,
    contenuFinal,
    structure
}=recupererArticle();

const res = await fetch(APPSCRIPT_URL,{
    method:"POST",
    body:new URLSearchParams({
        action:"update",
        password: sessionStorage.getItem("adminPassword"),
        id: editArticleId,
        title,
        categorie,
        img: firstImage,
        content: contenuFinal,
        structure: JSON.stringify(structure)
    })
});

const data=await res.json();

if(data.success){

alert("Modifications enregistrées !");

resetForm();

setTimeout(() => chargerArticlesAdmin(), 2000);

}

});


// 🔄 RESET FORM
function resetForm(){

editArticleId=null;
editDraftId = null;

document.getElementById("article-title").value="";
document.getElementById("article-categorie").value="";
document.getElementById("article-intro").value="";
document.getElementById("article-blocs").innerHTML="";

document.getElementById("article-intro").style.display="block";
document.getElementById("add-block-btn").style.display="block";
document.getElementById("add-block-2img-btn").style.display="block";
document.getElementById("publish-article").style.display="block";
document.getElementById("liste-articles").style.display="block";

document.getElementById("save-edit").style.display="none";
document.getElementById("cancel-edit").style.display="none";

}


// 📄 CHARGER ARTICLES
async function chargerArticlesAdmin(){

const res=await fetch(APPSCRIPT_URL+"?action=list");
const articles=await res.json();

const conteneur=document.getElementById("liste-articles");

conteneur.innerHTML="";

articles.forEach(article=>{

const ligne=document.createElement("div");

ligne.style.display="flex";
ligne.style.justifyContent="space-between";
ligne.style.padding="8px";
ligne.style.borderBottom="1px solid #ddd";

ligne.innerHTML = `
<span>${article.title}</span>

<div>
    <button class="edit-article" data-id="${article.id}">
        Modifier
    </button>

    <button class="delete-article" data-id="${article.id}">
        🗑 Supprimer
    </button>
</div>
`;

conteneur.appendChild(ligne);

});

}

function convertirUrlImageDrive(url) {
  if (!url) return "";

  return url.replace(
    /https:\/\/drive\.google\.com\/uc\?export=view&id=([^&"'\s]+)/g,
    "https://drive.google.com/thumbnail?id=$1&sz=w1200"
  );
}


function chargerStructure(structure){

    // Vider l'éditeur
    document.getElementById("article-blocs").innerHTML = "";

    // Restaurer l'introduction
    document.getElementById("article-intro").value =
        structure.intro || "";

    structure.blocs.forEach(blocJSON => {

        // =====================================
        // IMAGE SIMPLE
        // =====================================

        if(blocJSON.type === "image"){

            ajouterBlocSimple();

            const bloc =
                document.querySelector(
                    "#article-blocs .bloc-admin:last-child"
                );

            const url = convertirUrlImageDrive(blocJSON.image || "");

            const urlInput =
                bloc.querySelector(".bloc-img");

            const preview =
                bloc.querySelector(".image-preview");

            const dropZone =
                bloc.querySelector(".drop-zone");

            const removeBtn =
                bloc.querySelector(".remove-image");

            urlInput.value = url;

            bloc.querySelector(".bloc-img-position").value =
                blocJSON.position || "center";

            bloc.querySelector(".bloc-texte").value =
                blocJSON.texte || "";

            // Restaurer la prévisualisation
            if(url){

                preview.innerHTML = `
                    <img src="${url}" alt="Image">
                `;

                preview.classList.add("has-image");

                if(dropZone){
                    dropZone.classList.add("has-image");
                }

                if(removeBtn){
                    removeBtn.style.display = "block";
                }
            }
        }


        // =====================================
        // DOUBLE IMAGE
        // =====================================

        else if(blocJSON.type === "double"){

            ajouterBlocDouble();

            const bloc =
                document.querySelector(
                    "#article-blocs .bloc-admin:last-child"
                );

            const url1 = convertirUrlImageDrive(blocJSON.image1 || "");
            const url2 = convertirUrlImageDrive(blocJSON.image2 || "");

            const input1 =
                bloc.querySelector(".bloc-img1");

            const input2 =
                bloc.querySelector(".bloc-img2");

            const pickers =
                bloc.querySelectorAll(".image-picker");

            input1.value = url1;
            input2.value = url2;

            bloc.querySelector(".bloc-texte").value =
                blocJSON.texte || "";

            // Première image
            if(url1 && pickers[0]){

                const preview1 =
                    pickers[0].querySelector(".image-preview");

                const dropZone1 =
                    pickers[0].querySelector(".drop-zone");

                const removeBtn1 =
                    pickers[0].querySelector(".remove-image");

                preview1.innerHTML = `
                    <img src="${url1}" alt="Image 1">
                `;

                preview1.classList.add("has-image");

                if(dropZone1){
                    dropZone1.classList.add("has-image");
                }

                if(removeBtn1){
                    removeBtn1.style.display = "block";
                }
            }

            // Deuxième image
            if(url2 && pickers[1]){

                const preview2 =
                    pickers[1].querySelector(".image-preview");

                const dropZone2 =
                    pickers[1].querySelector(".drop-zone");

                const removeBtn2 =
                    pickers[1].querySelector(".remove-image");

                preview2.innerHTML = `
                    <img src="${url2}" alt="Image 2">
                `;

                preview2.classList.add("has-image");

                if(dropZone2){
                    dropZone2.classList.add("has-image");
                }

                if(removeBtn2){
                    removeBtn2.style.display = "block";
                }
            }
        }


        // =====================================
        // EMBED
        // =====================================

        else if(blocJSON.type === "embed"){

            document
                .getElementById("add-block-embed-btn")
                .click();

            const dernierBloc =
                document.querySelector(
                    "#article-blocs .bloc-admin:last-child"
                );

            dernierBloc.querySelector(".embed-type").value =
                blocJSON.provider;

            dernierBloc.querySelector(".embed-code").value =
                blocJSON.code;
        }


        // =====================================
        // VIDEO
        // =====================================

        else if(blocJSON.type === "video"){

            document
                .getElementById("add-block-video-btn")
                .click();

            const dernierBloc =
                document.querySelector(
                    "#article-blocs .bloc-admin:last-child"
                );

            dernierBloc.querySelector(".bloc-video").value =
                blocJSON.video;

            dernierBloc.querySelector(".bloc-texte").value =
                blocJSON.texte;
        }

    });
}


// ✏️ MODIFIER ARTICLE
document.addEventListener("click", async function(e){

if(e.target.classList.contains("edit-article")){

const id=e.target.dataset.id;

editArticleId=id;

const res=await fetch(APPSCRIPT_URL + "?action=get&id=" + id + "&t=" + new Date().getTime());

const article=await res.json();

document.getElementById("article-title").value=article.title || "";
document.getElementById("article-categorie").value=article.categorie || "";

const structure = JSON.parse(article.structure);

chargerStructure(structure);

document.getElementById("article-intro").style.display="none";
document.getElementById("add-block-btn").style.display="none";
document.getElementById("add-block-2img-btn").style.display="none";
document.getElementById("publish-article").style.display="none";
document.getElementById("liste-articles").style.display="none";

document.getElementById("save-edit").style.display="block";
document.getElementById("cancel-edit").style.display="block";

}



if (e.target.classList.contains("delete-article")) {

    if (!confirm("Supprimer définitivement cet article ?")) return;

    const id = e.target.dataset.id;

    const res = await fetch(APPSCRIPT_URL, {
        method: "POST",
        body: new URLSearchParams({
            action: "delete",
            password: sessionStorage.getItem("adminPassword"),
            id
        })
    });

    const data = await res.json();
    
    if (data.success) {
        chargerArticlesAdmin();
        alert("Article supprimé.");
    } else {
        alert("Erreur lors de la suppression.");
    }
}


if(e.target.classList.contains("edit-draft")){

    const id = e.target.dataset.id;

    editDraftId = id;

    const res = await fetch(
        APPSCRIPT_URL +
        "?action=getDraft&id=" + id
    );

    const draft = await res.json();

    editArticleId = null;

    document.getElementById(
        "article-title"
    ).value = draft.title;

    document.getElementById(
        "article-categorie"
    ).value = draft.categorie;

    document.getElementById(
        "article-intro"
    ).value = "";

    document.getElementById(
        "article-blocs"
    ).innerHTML = "";

    const structure =
        JSON.parse(draft.structure);

    document.getElementById(
        "article-intro"
    ).value = structure.intro || "";

    chargerStructure(structure);

}

if(e.target.classList.contains("delete-draft")){

    if(
        !confirm(
            "Supprimer ce brouillon ?"
        )
    ) return;

    const id = e.target.dataset.id;

    const res = await fetch(
        APPSCRIPT_URL,
        {
            method:"POST",

            body:new URLSearchParams({

                action:"deleteDraft",

                password:
                    sessionStorage.getItem(
                        "adminPassword"
                    ),

                id

            })
        }
    );

    const data = await res.json();

    if(data.success){

        alert(
            "Brouillon supprimé."
        );

        chargerBrouillons();

    }

}

});






// ❌ ANNULER
document.getElementById("cancel-edit").addEventListener("click",function(){

resetForm();

});


document.getElementById("preview-article")
    .addEventListener("click", previewArticle);

function previewArticle(){

    const title =
        document.getElementById("article-title").value;

    const categorie =
        document.getElementById("article-categorie").value;

    const {
        contenuFinal
    } = recupererArticle();

    document.getElementById("preview-content").innerHTML = `

        <button
            onclick="fermerPreview()"
            style="
                float:right;
                padding:.5rem 1rem;
                margin-bottom:1rem;
            ">

            ✖ Fermer

        </button>

        <h1>
            ${title || "Article sans titre"}
        </h1>

        <div class="preview-meta">

            ${categorie || "Sans catégorie"}
            ·
            ${new Date().toLocaleDateString("fr-FR")}

        </div>

        <div class="article-content">

            ${contenuFinal}

        </div>

    `;

    document
        .getElementById("preview-modal")
        .classList
        .remove("hidden");

}

function fermerPreview(){

    document
        .getElementById("preview-modal")
        .classList
        .add("hidden");

}

let draggedBloc = null;

document.addEventListener("dragstart", e => {

    const bloc = e.target.closest(".bloc-admin");

    if (!bloc) return;

    draggedBloc = bloc;

});

new Sortable(document.getElementById("article-blocs"), {
    animation: 150,
    handle: ".drag-handle",
    ghostClass: "drag-ghost"
});


function setupDropZone(bloc){

    const dropZones = bloc.querySelectorAll(".drop-zone");

    dropZones.forEach((dropZone) => {

        // Trouver le bloc image correspondant
        const imagePicker = dropZone.closest(".image-picker");

        if(!imagePicker){
            return;
        }

        const urlInput = imagePicker.querySelector('input[type="text"]');
        const fileInput = imagePicker.querySelector(".image-file");
        const preview = imagePicker.querySelector(".image-preview");
        const removeBtn = imagePicker.querySelector(".remove-image");

        if(!dropZone || !fileInput || !preview){
            return;
        }


        // -----------------------------------------
        // CLIC SUR LA ZONE
        // -----------------------------------------

        dropZone.addEventListener("click", function(e){

            if(e.target === removeBtn){
                return;
            }

            fileInput.click();

        });


        // -----------------------------------------
        // SELECTION CLASSIQUE
        // -----------------------------------------

        fileInput.addEventListener("change", function(){

            if(this.files && this.files[0]){

                traiterImage(
                    this.files[0],
                    urlInput,
                    preview,
                    dropZone,
                    removeBtn
                );

            }

        });


        // -----------------------------------------
        // DRAGOVER
        // -----------------------------------------

        dropZone.addEventListener("dragover", function(e){

            e.preventDefault();
            e.stopPropagation();

            dropZone.classList.add("dragover");

        });


        // -----------------------------------------
        // DRAGLEAVE
        // -----------------------------------------

        dropZone.addEventListener("dragleave", function(e){

            e.preventDefault();
            e.stopPropagation();

            dropZone.classList.remove("dragover");

        });


        // -----------------------------------------
        // DROP
        // -----------------------------------------

        dropZone.addEventListener("drop", function(e){

            e.preventDefault();
            e.stopPropagation();

            dropZone.classList.remove("dragover");

            const file = e.dataTransfer.files[0];

            if(!file){
                return;
            }

            if(!file.type.startsWith("image/")){
                alert("Veuillez déposer une image.");
                return;
            }

            // On traite directement l'image
            traiterImage(
                file,
                urlInput,
                preview,
                dropZone,
                removeBtn
            );

        });


        // -----------------------------------------
        // SUPPRIMER L'IMAGE
        // -----------------------------------------

        if(removeBtn){

            removeBtn.addEventListener("click", function(e){

                e.preventDefault();
                e.stopPropagation();

                if(urlInput){
                    urlInput.value = "";
                }

                preview.innerHTML = "";

                preview.classList.remove("has-image");

                dropZone.classList.remove("has-image");

                fileInput.value = "";

                removeBtn.style.display = "none";

            });

        }

    });

}

async function traiterImage(
    file,
    urlInput,
    preview,
    dropZone,
    removeBtn
){

    if(!file){
        return;
    }

    // Vérification du type
    if(!file.type.startsWith("image/")){

        alert("Veuillez sélectionner une image.");

        return;
    }


    // -----------------------------------------
    // PREVISUALISATION IMMEDIATE
    // -----------------------------------------

    const reader = new FileReader();

    reader.onload = function(event){

    preview.innerHTML = `
        <img src="${event.target.result}" alt="Prévisualisation">
        <div class="image-file-name">
            📎 ${file.name}
        </div>
    `;

    preview.classList.add("has-image");
    dropZone.classList.add("has-image");

    if(removeBtn){
        removeBtn.style.display = "block";
    }

    };

    reader.readAsDataURL(file);


    // -----------------------------------------
    // LECTURE BASE64
    // -----------------------------------------

    try {

        const base64Data = await lireFichierBase64(file);


        // -----------------------------------------
        // MOT DE PASSE ADMIN
        // -----------------------------------------

        const password =
            sessionStorage.getItem("adminPassword");


        if(!password){

            alert("Session administrateur expirée.");

            return;
        }


        // -----------------------------------------
        // ENVOI À GOOGLE APPS SCRIPT
        // -----------------------------------------

        const params = new URLSearchParams();

        params.append("action", "uploadImage");
        params.append("password", password);
        params.append("fileName", file.name);
        params.append("mimeType", file.type);
        params.append("data", base64Data);


        // Indication visuelle
        dropZone.classList.add("uploading");


        const response = await fetch(
            APPSCRIPT_URL,
            {
                method: "POST",
                body: params
            }
        );


        const result = await response.json();


        dropZone.classList.remove("uploading");


        // -----------------------------------------
        // VERIFICATION
        // -----------------------------------------

        if(!result.success){

            console.error(result);

            alert(
                "Erreur lors de l'envoi de l'image :\n" +
                (result.error || "Erreur inconnue")
            );

            return;
        }


        // -----------------------------------------
        // STOCKER L'URL DANS LE BLOC
        // -----------------------------------------

        if(urlInput){

            urlInput.value = result.url;

        }


        console.log(
            "Image envoyée avec succès :",
            result.url
        );


    } catch(error){

        dropZone.classList.remove("uploading");

        console.error(
            "Erreur upload image :",
            error
        );

        alert(
            "Impossible d'envoyer l'image."
        );

    }

}

function lireFichierBase64(file){

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = function(){

            const result = reader.result;

            // Supprime :
            // data:image/jpeg;base64,
            // pour ne garder que le Base64
            const base64 = result.split(",")[1];

            resolve(base64);

        };

        reader.onerror = function(error){

            reject(error);

        };

        reader.readAsDataURL(file);

    });

}

function startAutoSave(){

    hasUnsavedChanges = true;

    clearTimeout(autoSaveTimer);

    autoSaveTimer = setTimeout(() => {

        saveDraftAuto();

    },30000);

}

async function chargerBrouillons(){

    const res = await fetch(
        APPSCRIPT_URL + "?action=listDrafts"
    );

    const brouillons = await res.json();

    const conteneur =
        document.getElementById(
            "liste-brouillons"
        );

    conteneur.innerHTML = "";

    brouillons.forEach(brouillon=>{

        const ligne =
            document.createElement("div");

        ligne.style.display = "flex";
        ligne.style.justifyContent =
            "space-between";

        ligne.style.padding = "8px";
        ligne.style.borderBottom =
            "1px solid #ddd";

        ligne.innerHTML = `

            <span>
                ${brouillon.title}
            </span>

            <div>

                <button
                    class="edit-draft"
                    data-id="${brouillon.id}">

                    Continuer

                </button>

                <button
                    class="delete-draft"
                    data-id="${brouillon.id}">

                    🗑 Supprimer

                </button>

            </div>

        `;

        conteneur.appendChild(ligne);

    });

}

chargerArticlesAdmin();
chargerBrouillons();