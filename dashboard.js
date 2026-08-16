function createWebsite() {

    const name = prompt(
        "Enter a name for your website:"
    );

    if (!name) {
        return;
    }

    localStorage.setItem(
        "myhost_project_name",
        name
    );

    window.location.href = "editor.html";
}


function logout() {

    alert(
        "Logout will be connected to Supabase."
    );

}
