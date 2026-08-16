let currentUser = null;


async function getCurrentUser() {

    const {
        data,
        error
    } = await supabaseClient.auth.getUser();


    if (error) {

        console.error(error);

        return null;
    }


    return data.user;
}


async function loadDashboard() {

    currentUser =
        await getCurrentUser();


    if (!currentUser) {

        window.location.href =
            "login.html";

        return;
    }


    document.getElementById(
        "userEmail"
    ).textContent =
        currentUser.email;


    await loadProjects();

}


async function loadProjects() {

    const {
        data: projects,
        error
    } =
        await supabaseClient
            .from("projects")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(error);

        document.getElementById(
            "projects"
        ).innerHTML = `
            <div class="empty">
                Could not load websites.
                <br><br>
                ${escapeHTML(error.message)}
            </div>
        `;

        return;
    }


    const container =
        document.getElementById(
            "projects"
        );


    if (!projects.length) {

        container.innerHTML = `

            <div class="empty">

                <div class="empty-icon">
                    🌐
                </div>

                <h2>
                    No websites yet
                </h2>

                <p>
                    Create your first website.
                </p>

                <button
                    class="create"
                    onclick="createWebsite()"
                >
                    Create Website
                </button>

            </div>

        `;

        return;
    }


    container.innerHTML = "";


    projects.forEach(project => {

        const card =
            document.createElement("div");

        card.className =
            "project-card";


        card.innerHTML = `

            <h2>
                ${escapeHTML(project.name)}
            </h2>

            <p class="project-status">
                ${
                    project.published
                        ? "🟢 Published"
                        : "⚪ Draft"
                }
            </p>

            <button
                onclick="openProject('${project.id}')"
            >
                Open
            </button>

            <button
                class="delete-button"
                onclick="deleteProject('${project.id}')"
            >
                Delete
            </button>

        `;


        container.appendChild(card);

    });

}


function createWebsite() {

    window.location.href =
        "editor.html?new=true";

}


function openProject(id) {

    window.location.href =
        "editor.html?id=" +
        encodeURIComponent(id);

}


async function deleteProject(id) {

    const confirmed =
        confirm(
            "Delete this website permanently?"
        );


    if (!confirmed) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("projects")
            .delete()
            .eq("id", id);


    if (error) {

        alert(error.message);

        return;
    }


    await loadProjects();

}


async function logout() {

    const {
        error
    } =
        await supabaseClient.auth.signOut();


    if (error) {

        alert(error.message);

        return;
    }


    window.location.href =
        "index.html";

}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;

}


loadDashboard();
