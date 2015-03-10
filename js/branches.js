$(document).ready(function() {
    var form = $("#qa-merge-form").show();
    form.steps({
        headerTag: "h3",
        bodyTag: "fieldset",
        transitionEffect: "slideLeft",
        enableKeyNavigation: false,
        enablePagination: false,
        enableAllSteps: false,
        forceMoveForward: false
            /* onStepChanging: function(event, currentIndex, newIndex) {
                 // Allways allow previous action even if the current form is not valid!
                 if (currentIndex > newIndex) {
                     return true;
                 }

                 // validate username password if currentIndex = 0 and newIndex = 1
                 if (currentIndex == 0 && newIndex == 1) {
                     var username = $("#username").val();
                     var password = $("#password").val();
                     // Checking for blank fields.
                     if (username == '' || password == '') {
                         $('input[type="text"],input[type="password"]').css("border", "2px solid red");
                         $('input[type="text"],input[type="password"]').css("box-shadow", "0 0 3px red");
                         alert("Please fill all fields...!!!!!!");
                     } else {
                         $.ajax({
                             type: 'post',
                             url: '/authenticate',
                             data: {
                                 'username': username,
                                 'password': password
                             },
                             async: false,
                             success: function(data) {
                                 $("form")[0].reset();
                                 form.validate().settings.ignore = ":disabled,:hidden";
                                 return true;
                             },
                             error: function(data) {
                                 if (data.message != null) {
                                     var json = eval("(" + data.message + ")");
                                     $('input[type="text"],input[type="password"]').css({
                                         "border": "2px solid red",
                                         "box-shadow": "0 0 3px red"
                                     });
                                     alert(json.message);
                                 }
                             }
                         });
                     }
                 } else {
                     // Forbid next action on "Warning" step if the user is to young
                     if (newIndex === 3 && Number($("#age-2").val()) < 18) {
                         return false;
                     }
                     // Needed in some cases if the user went back (clean up)
                     if (currentIndex < newIndex) {
                         // To remove error styles
                         form.find(".body:eq(" + newIndex + ") label.error").remove();
                         form.find(".body:eq(" + newIndex + ") .error").removeClass("error");
                     }
                     form.validate().settings.ignore = ":disabled,:hidden";
                     return form.valid();
                 }
             },
             onStepChanged: function(event, currentIndex, priorIndex) {
                 // Used to skip the "Warning" step if the user is old enough.
                 if (currentIndex === 2 && Number($("#age-2").val()) >= 18) {
                     form.steps("next");
                 }
                 // Used to skip the "Warning" step if the user is old enough and wants to the previous step.
                 if (currentIndex === 2 && priorIndex === 3) {
                     form.steps("previous");
                 }
             },
             onFinishing: function(event, currentIndex) {
                 form.validate().settings.ignore = ":disabled";
                 return form.valid();
             },
             onFinished: function(event, currentIndex) {
                 alert("Submitted!");
             } */
    }).validate({
        errorPlacement: function errorPlacement(error, element) {
            element.before(error);
        },
        rules: {
            confirm: {
                equalTo: "#password-2"
            }
        }
    });

    $("#login").click(function() {
        var username = $("#username").val();
        var password = $("#password").val();
        // Checking for blank fields.
        if (username == '' || password == '') {
            $('input[type="text"],input[type="password"]').css("border", "2px solid red");
            $('input[type="text"],input[type="password"]').css("box-shadow", "0 0 3px red");
            alert("Please fill all fields...!!!!!!");
        } else {
            $.post("/authenticate", {
                    username: username,
                    password: password
                },
                function(data) {
                    if (data.message != null) {
                        var json = eval("(" + data.message + ")");
                        $('input[type="text"],input[type="password"]').css({
                            "border": "2px solid red",
                            "box-shadow": "0 0 3px red"
                        });
                        alert(json.message);
                    } else {
                        // logged in
                        form.steps("setStep", 1);

                        // get branches and populate the drop down
                        $.get("/getBranches", {},
                            function(data) {
                                var branches = $("#branches")
                                for (var i = 0; i < data.length; i++) {
                                    var branch = data[i].name;
                                    branches.append(new Option(branch, branch));
                                }
                            });
                    }
                });
        }
    });

    $("#submit").click(function() {
        var branch = $("#branches").val();
        var action = $("#action").val();

        if (action == "create-branch") {
            $.post("/merge", {
                    branchName: branch
                },
                function(data) {
                    console.log(data);
                    if (data.commit != null) {
                        $("#status").text(data.commit.message + " was applied by " 
                                                              + data.commit.author.name 
                                                              + ". Click on the link to see details");
                        $("#status_url").text(data.html_url).prop("href", data.html_url);
                        form.steps("setStep", 2);
                    }
                });
        } else {
            $.post("/createPull", {
                    branchName: branch
                },
                function(data) {
                    console.log(data);
                    if (data.title != null) {
                        $("#status").text(data.title + ". Click on the link to see details");
                        $("#status_url").text(data.html_url).prop("href", data.html_url);
                        form.steps("setStep", 2);
                    }
                });
        }
    });
});
