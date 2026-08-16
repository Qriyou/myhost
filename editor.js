let currentUser = null;

let currentProject = null;

let currentTab = "html";


const params =
    new URLSearchParams(
        window.location.search
    );


const projectId =
    params.get("id");


let files = {

    html: `
<h1>Hello from MyHost!</h1>

<p>
    My first website is working!
</p>
`,

    css: `
body {
    font-family: Arial;
    text-align: center;
    padding: 50px;
}
`,

    javascript: `
console.log("Website loaded!");
`

};


async function getUser() {

    const {
        data,
        error
    } =
        await supabaseClient
            .auth
            .getUser();


    if (error) {

        console.error(error);

        return null;
    }


    return data.user;

}


async function init() {

    currentUser =
        await getUser();


    if (!currentUser) {

        window.location.href =
            "login.html";

        return;
    }


    if (projectId) {

        await loadProject();

    }
    else {

        const name =
            prompt(
                "What should your website be called?"
            );


        if (!name) {

            window.location.href =
                "dashboard.html";

            return;
        }


        document.getElementById(
            "projectName"
        ).textContent =
            name;


        currentProject = {

            name: name,

            slug: createSlug(name)

        };

    }


    document.getElementById(
        "code"
    ).value =
        files.html;


    updatePreview();

}


async function loadProject() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("projects")
            .select("*")
            .eq("id", projectId)
            .single();


    if (error) {

        alert(
            "Could not load project: " +
            error.message
        );

        window.location.href =
            "dashboard.html";

        return;
    }


    currentProject =
        data;


    files.html =
        data.html || "";


    files.css =
        data.css || "";


    files.javascript =
        data.javascript || "";


    document.getElementById(
        "projectName"
    ).textContent =
        data.name;


    document.getElementById(
        "code"
    ).value =
        files.html;


    updatePreview();

}


function switchTab(tab) {

    files[currentTab] =
        document.getElementById(
            "code"
        ).value;


    currentTab =
        tab;


    document.getElementById(
        "code"
    ).value =
        files[tab];


    document
        .querySelectorAll(".tab")
        .forEach(element => {

            element.classList.remove(
                "active"
            );

        });


    const active =
        document.querySelector(
            `.tab[data-tab="${tab}"]`
        );


    if (active) {

        active.classList.add(
            "active"
        );

    }


    updatePreview();

}


function updatePreview() {

    files[currentTab] =
        document.getElementById(
            "code"
        ).value;


    const previewHTML = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta name="viewport"
content="width=device-width, initial-scale=1">

<style>

${files.css}

</style>

</head>

<body>

${files.html}

<script>

${files.javascript}

<\/script>

</body>

</html>

`;


    document.getElementById(
        "preview"
    ).srcdoc =
        previewHTML;

}


async function saveProject() {

    files[currentTab] =
        document.getElementById(
            "code"
        ).value;


    if (!currentProject) {

        alert(
            "No project loaded."
        );

        return;
    }


    const updateData = {

        name:
            currentProject.name,

        html:
            files.html,

        css:
            files.css,

        javascript:
            files.javascript,

        updated_at:
            new Date().toISOString()

    };


    let result;


    if (currentProject.id) {

        result =
            await supabaseClient
                .from("projects")
                .update(updateData)
                .eq(
                    "id",
                    currentProject.id
                );

    }
    else {

        result =
            await supabaseClient
                .from("projects")
                .insert({

                    user_id:
                        currentUser.id,

                    name:
                        currentProject.name,

                    slug:
                        currentProject.slug,

                    html:
                        files.html,

                    css:
                        files.css,

                    javascript:
                        files.javascript,

                    published:
                        false

                })
                .select()
                .single();


        if (!result.error) {

            currentProject =
                result.data;

        }

    }


    if (result.error) {

        console.error(
            result.error
        );

        alert(
            "Save failed: " +
            result.error.message
        );

        return;
    }


    alert(
        "✅ Website saved!"
    );

}


async function publishProject() {

    await saveProject();


    if (!currentProject?.id) {

        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("projects")
            .update({

                published: true,

                updated_at:
                    new Date().toISOString()

            })
            .eq(
                "id",
                currentProject.id
            );


    if (error) {

        alert(
            "Publishing failed: " +
            error.message
        );

        return;
    }


    alert(
        "🚀 Website marked as published!"
    );

}


function createSlug(name) {

    return name

        .toLowerCase()

        .trim()

        .replace(
            /[^a-z0-9]+/g,
            "-"
        )

        .replace(
            /^-+|-+$/g,
            "" 
        )

        .substring(
            0,
            50
        );

}


function goDashboard() {

    window.location.href =
        "dashboard.html";

}


document
    .getElementById("code")
    .addEventListener(
        "input",
        updatePreview
    );


init();
