// Create our own local controller service.
// We have namespaced local services with "symgif:"
var symgifControllerService = SYMPHONY.services.register("symgif:controller");

// This is the message controller service, to be used for static and dynamic rendering
var messageControllerService = SYMPHONY.services.register("message:controller");

// All Symphony services are namespaced with SYMPHONY
SYMPHONY.remote.hello().then(function(data) {

    // Register our application with the Symphony client:
    // Subscribe the application to remote (i.e. Symphony's) services
    // Register our own local services
    SYMPHONY.application.register("symgif", ["modules", "applications-nav", "ui", "share", "entity"], ["symgif:controller", "message:controller"]).then(function(response) {

        // The userReferenceId is an anonymized random string that can be used for uniquely identifying users.
        // The userReferenceId persists until the application is uninstalled by the user. 
        // If the application is reinstalled, the userReferenceId will change.
        var userId = response.userReferenceId;

        // Subscribe to Symphony's services
        var modulesService = SYMPHONY.services.subscribe("modules");
        var navService = SYMPHONY.services.subscribe("applications-nav");
        var uiService = SYMPHONY.services.subscribe("ui");
        var shareService = SYMPHONY.services.subscribe("share");
        var entityService = SYMPHONY.services.subscribe("entity");
        var dialogsService = SYMPHONY.services.subscribe("dialog");
        entityService.registerRenderer(
            "com.symphony.timer",
            {},
            "message:controller"
        );

        // LEFT NAV: Add an entry to the left navigation for our application
        navService.add("symgif-nav", "Symphony Gif Search", "symgif:controller");

        // SHARE: Set the controller that implements the "link" method invoked when shared articles are clicked on.
        shareService.handleLink("article", "symgif:controller");

        // Implement some methods on our local service. These will be invoked by user actions.
        symgifControllerService.implement({

            // LEFT NAV & MODULE: When the left navigation item is clicked on, invoke Symphony's module service to show our application in the grid
            select: function(id) {
                if (id == "symgif-nav") {
                    // Focus the left navigation item when clicked
                    navService.focus("symgif-nav");
                }

                modulesService.show("symgif", {title: "Symphony Gif Search"}, "symgif:controller", "https://symgif.adorjan.co/app.html", {
                    // You must specify canFloat in the module options so that the module can be pinned
                    "canFloat": true,
                });
                // Focus the module after it is shown
                modulesService.focus("symgif");
            },

            // SHARE: Open our app in the context of an article:
            // Put the article in the moudle title.
            // Include the article in the URL parameters.
            link: function(type, articleId) {
                if(type == "article") {
                    var moduleTitle = "Symphony Gif App: " + articleId;
                    modulesService.show("symgif-article", {title: moduleTitle}, "symgif:controller", "https://symgif.adorjan.co/app.html?article=" + articleId, {
                        "canFloat": true,
                        // Use parentModuleId to open a new module without closing the original module ("symgif")
                        "parentModuleId": "symgif"
                    });
                    modulesService.focus("symgif-article");
                }
            },

            share: function(number, time) {
                var title = 'Test Title';
                var blurb = 'Test Blurb';
                var date = new Date().getTime() / 1000;
                var thumbnail = '';
                var id = JSON.stringify({number: 'number', time: 'time'});
                
                var presentationML =`
                    <entity><h1>${title}</h1>${blurb}
                    </entity>
                `;
                var entityJSON = {
                    date: date,
                    thumbnail: thumbnail,
                    results: id,
                    time: time,
                    number: number
                };
                var data = {
                    plaintext: `*${title}*\n${blurb}\n`,
                    presentationML: presentationML,
                    entityJSON: entityJSON,
                    entity: {},
                    format: 'com.symphony.messageml.v2',
                    inputAutofill: 'EXAMPLE FULL!',
                }
                this.shareService.share('com.symfuny.invite.won', data)
            },

        });

    }.bind(this))
}.bind(this));