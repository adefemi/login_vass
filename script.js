const BASE_URL = "http://staging-1.tm30.net:8096/users/api/v1";
const LOGIN_URL = BASE_URL + "/auths/login";
const REDIRECT_BASE = "http://localhost:3000";
const VAAS_TOKEN="vas_token"

getQueryStringParams = query => {
    return query
        ? (/^[?#]/.test(query) ? query.slice(1) : query)
            .split('&')
            .reduce((params, param) => {
                    let [key, value] = param.split('=');
                    params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
                    return params;
                }, {}
            )
        : {}
};

(() => {
    const redirect = getQueryStringParams(window.location.search).redirect;
    const logout = getQueryStringParams(window.location.search).logout;

    $("#close").click(function () {
        $("#notifier").addClass("hidden")
    })
    // const searchParams =
    $("#login-form").submit(function(e) {
        e.preventDefault();
        const loginForm = $(this);
        const data = {}
        const formData = loginForm.serializeArray();
        for(let i =0; i < formData.length; i++){
            data[formData[i].name] = formData[i].value;
        }
        const notifier = $("#notifier");
        const notifierText = $("#notifier-text");

        if(!notifier.hasClass("hidden")){
            notifier.addClass("hidden")
        }

        let submit_btn = $("#login-submit");
        submit_btn.addClass("load");
        let text = submit_btn.find(".btn-text")[0];
        const defaultText = $(text).text();
        $(text).text("Logging in");

        axios.post(LOGIN_URL, data).then(
            res => {
                const refreshToken = res.data.data.refresh;
                localStorage.setItem(VAAS_TOKEN, refreshToken)
                window.location.href = REDIRECT_BASE + `${redirect ? redirect : "/admin"}?refresh=${refreshToken}`;
            },
            err => {
                if(err.response){
                    notifierText.text(err.response.data.error)
                }
                else{
                    notifierText.text("There is an error connecting to network");
                }

                notifier.removeClass("hidden");

                $(text).text(defaultText);
                submit_btn.removeClass("load")
            }
        )
    })

    //check refresh

    if(!logout){
        const refresh = localStorage.getItem(VAAS_TOKEN)
        if(refresh){
            axios.post(BASE_URL+"/auths/token/refresh", {refresh}).then(
                res => {
                    const refreshToken = res.data.data.refresh;
                    localStorage.setItem(VAAS_TOKEN, refreshToken)
                    window.location.href = REDIRECT_BASE + `${redirect ? redirect : "/admin"}?refresh=${refreshToken}`;
                },
                _ => {
                    localStorage.removeItem(VAAS_TOKEN)
                }
            )
        }
    }
    else{
        localStorage.removeItem(VAAS_TOKEN)
    }

})();