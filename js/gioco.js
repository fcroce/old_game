
var statoGioco = true,
    livello = 0,
    points = 0,
    lvltimeout = 30,
    gLoop,
    width = jQuery("#terreno").css("width").replace(/[^-\d\.]/g, ''),
    height = jQuery("#terreno").css("height").replace(/[^-\d\.]/g, ''),
    background = '#d0e7f9',
    terreno = jQuery("#terreno")[0],
    ctx = terreno.getContext('2d'); //two-dimensional graphic context of the canvas

terreno.width = width;  
terreno.height = height;


jQuery(function() {
    jQuery('#timer').countdown({until: lvltimeout, format: 'MS', onExpiry: GameOver});
    
    jQuery('#pause-resume').click(function() {
        if (!statoGioco) resumeTimer();
        else pauseTimer();
    });
    
    statusbar = jQuery("#status_bar_testo");
    statusbar.text("Livello: " + (livello+1) + " - Punti: " + points);
    
    jQuery('#jump')[0].volume = 0.2;
    
    jQuery('#soundtrack')[0].volume = 0.4;
    jQuery('#soundtrack')[0].play();
});


var n_nuvole = 5,
    nuvole = [];

for (var i = 0; i < n_nuvole; i++) {
    nuvole.push([Math.random() * width, Math.random() * (height/2), 200 + (Math.random() * 200), 60 + (Math.random() * 60), 3 + Math.random() * 3, Math.random() / 2]);
}


var livelli = [],
    piattaforme = [],
    piattaformaWidth = 70,
    piattaformaHeight = 20,
    fragole = [];


var piattaforma = function (x, y, type) {
    var that = this;
    
    that.firstColor = '#FFFFFF';
    that.secondColor = '#D0E8F9';
    that.onCollide = function () {
        if ( (player.Y >= that.y) || player.isFalling) {
            player.setPosition(player.X, that.y - player.height);
            player.fallStop();
            player.su_piattaforma = that;
        }
        else if ( player.Y >= (that.y - piattaformaHeight) ) {
            player.jumpSpeed = 1
            player.setPosition(player.X, that.y + piattaformaHeight);
            
        }
    }
    
    if (type == 1) {
        that.firstColor = '#FDFBCE';
        that.secondColor = '#D0E8F9';
        that.onCollide = function () {
            if ( (player.Y >= that.y) || player.isFalling) {
                player.setPosition(player.X, that.y - player.height);
                player.fallStop();
                player.su_piattaforma = that;
                player.jump();
                player.jumpSpeed = 25;
            }
            else if ( player.Y >= (that.y - piattaformaHeight) ) {
                player.jumpSpeed = 1
                player.setPosition(player.X, that.y + piattaformaHeight);
    
            }
        }
    }
    
    that.x = ~~x;
    that.y = ~~y;
    that.type = type;
    
    
    that.draw = function () {
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        var gradient = ctx.createRadialGradient(that.x + (piattaformaWidth/2), that.y + (piattaformaHeight/2), 5, that.x + (piattaformaWidth/2), that.y + (piattaformaHeight/2), 45);
        
        gradient.addColorStop(0, that.firstColor);
        gradient.addColorStop(1, that.secondColor);
        ctx.fillStyle = gradient;
        roundRect(ctx, that.x, that.y, piattaformaWidth, piattaformaHeight, 15, true);
        
        
        if (that.type == 1) {
            ctx.fillStyle = "#C39F00";
            ctx.font = "12px Arial";
            ctx.fillText("Move UP", that.x + 10, that.y + 15);
        }
    }
    
    
    return that;
}




var strawberry = function (x, y) {
    var that = this;
    
    that.X = ~~x;
    that.Y = ~~y;
    
    that.width = 16;
    that.height = 16;
    
    that.visible = true;
    
    that.frames = 1;
    that.interval = 0;
    
    that.image = new Image(that.width, that.height);
    that.image.src = "img/strawberry.png";
    that.actualFrame = 0;
    
    that.setPosition = function (x, y) {
        that.X = ~~x;
        that.Y = ~~y;
    }
    
    that.draw = function() {
        if (!that.visible) return;
        
        try {
            ctx.drawImage(that.image, 0, that.height * that.actualFrame, that.width, that.height, that.X, that.Y, that.width, that.height);
        }
        catch (e) {}
        
        
        if (that.interval == 16 ) {
            if (that.actualFrame == that.frames) {
                that.actualFrame = 0;
            } else {
                that.actualFrame++;
            }
            that.interval = 0;
        }
        that.interval++;
    }
    
    that.checkcollision = function() {
        if (!that.visible) return;
        
        if (
            (
                (player.X >= that.X) &&
                (player.X <= (that.X + that.width)) &&
                (player.Y >= that.Y) &&
                (player.Y <= (that.Y + that.height))
            ) || (
                ((player.X + player.width) >= that.X) &&
                ((player.X + player.width) <= (that.X + that.width)) &&
                ((player.Y + player.height) >= that.Y) &&
                ((player.Y + player.height) <= (that.Y + that.height))
            ) || (
                (player.X <= that.X) &&
                ((player.X + player.width) >= (that.X + that.width)) &&
                (player.Y <= that.Y) &&
                ((player.Y + player.height) >= (that.Y + that.height))
            )
        ) {
            jQuery('#eat')[0].play();
            that.visible = false;
            points += 100;
            statusbar.text("Livello: " + (livello+1) + " - Punti: " + points);
        }
    }
    
    return that;
}




var player = new ( function () {
    var that = this;
    
    that.width = 27;
    that.height = 32;
    that.X = 0;
    that.Y = 0;
    
    that.frames = 5;
    that.interval = 0;
    
    that.playerRight = new Image(that.width, that.height);
    that.playerRight.src = "img/yoshi_right.png";
    that.actualFrameRight = 0;
    
    that.playerLeft = new Image(that.width, that.height);
    that.playerLeft.src = "img/yoshi_left.png";
    that.actualFrameLeft = 0;
    
    that.image = new Image(that.width, that.height);
    that.image.src = "img/yoshi_right.png";
    that.actualFrame = 0;
    
    that.ismovingRight = false;
    that.ismovingLeft = false;
    that.isgoingtoJump = false;
    that.isJumping = false;
    that.isFalling = false;
    that.jumpSpeed = 0;
    that.fallSpeed = 0;
    
    that.su_piattaforma = null;
    
    
    
    that.moveLeft = function () {
        if (that.X > 0) {
            if (that.actualFrameRight == 1) that.actualFrameRight = 0;
            var tmp = that.image.src.split("/");
            if (tmp[tmp.lenght-1] != "yoshi_left.png") that.image = that.playerLeft;
            that.setPosition(that.X - 5, that.Y);
        }
        
        if (
            (that.su_piattaforma != null) &&
            ((that.X + (that.width/2)) < that.su_piattaforma.x) &&
            (that.Y == that.su_piattaforma.y - that.height)
        ) {
            that.isFalling = true;
            that.su_piattaforma = null;
            that.setPosition(that.X - (that.width/2), that.Y + 5);
        }
    }
    
    that.moveRight = function () {
        if (that.X + that.width < width) {
            if (that.actualFrameLeft == 1) that.actualFrameLeft = 0;
            var tmp = that.image.src.split("/");
            if (tmp[tmp.lenght-1] != "yoshi_right.png") that.image = that.playerRight;
            that.setPosition(that.X + 5, that.Y);
        }
        
        if (
            (that.su_piattaforma != null) &&
            (that.X + (that.width/2) > (that.su_piattaforma.x + piattaformaWidth)) &&
            (that.Y == that.su_piattaforma.y - that.height)
        ) {
            that.isFalling = true;
            that.su_piattaforma = null;
            that.setPosition(that.X + (that.width/2), that.Y + 5);
        }
    }
    
    
    that.jump = function() {
        if (!that.isJumping && !that.isFalling) {
            that.fallSpeed = 0;
            that.isJumping = true;
            that.jumpSpeed = 17;
            jQuery('#jump')[0].play();
        }
    }
    
    that.checkJump = function () {
        
        var collision = checkCollision(that.X, that.Y - that.jumpSpeed);
        
        if (collision) {
            that.jumpSpeed = 0;
        }
        else {
            that.setPosition(that.X, that.Y - that.jumpSpeed);
            that.jumpSpeed--;
        }
        
        if (that.jumpSpeed == 0) {
            that.isJumping = false;
            that.isFalling = true;
            that.fallSpeed = 1;
        }
    }
    
    that.checkFall = function () {
        if (that.Y < height - that.height) {
            that.setPosition(that.X, that.Y + that.fallSpeed);
            if (that.fallSpeed < piattaformaHeight) that.fallSpeed++;
        }
        else {
            player.setPosition(that.X, height - player.height);
            that.fallStop();
            that.su_piattaforma = null;
        }
    }
    
    that.fallStop = function () {
        that.isFalling = false;
        that.fallSpeed = 0;
    }
    
    
    that.setPosition = function (x, y) {
        that.X = x;
        that.Y = y;
    }
    
    that.draw = function() {
        try {
            if (that.isJumping || that.isFalling) ctx.drawImage(that.image, 0, 0, that.width, that.height, that.X, that.Y, that.width, that.height);
            else ctx.drawImage(that.image, 0, that.height * that.actualFrame, that.width, that.height, that.X, that.Y, that.width, that.height);
        }
        catch (e) {}
        
        
        if (that.interval == 6 ) {
            if (that.actualFrame == that.frames) {
                that.actualFrame = 0;
            } else {
                that.actualFrame++;
            }
            that.interval = 0;
        }
        that.interval++;
    }
    
})();
player.setPosition(40, height - player.height);


jQuery(document).keydown(function(event) {
    event.preventDefault();
    if ((event.which == 68) || (event.which == 39)) { player.ismovingRight = true; }
    if ((event.which == 65) || (event.which == 37)) { player.ismovingLeft = true; }
    if ((event.which == 87) || (event.which == 38)) { player.isgoingtoJump = true; }
    //if ((event.which == 83) || (event.which == 40)) { player.getDown(); }
});
jQuery(document).keyup(function(event) {
    event.preventDefault();
    if ((event.which == 68) || (event.which == 39)) { player.ismovingRight = false; }
    if ((event.which == 65) || (event.which == 37)) { player.ismovingLeft = false; }
    if ((event.which == 87) || (event.which == 38)) { player.isgoingtoJump = false; }
    //if ((event.which == 83) || (event.which == 40)) { player.getDown(); }
});


generaGraficaLivello();


function gameLoop() {
    
    clear();
    
    jQuery(window).scrollTop(player.Y - 300);
    
    muoviNuvole();
    disegnaNuvole();
    
    livelli[livello].forEach(function(piattaforma) {
        piattaforma.draw();
    });
    
    fragole[livello].forEach(function(fragola) {
        fragola.draw();
        fragola.checkcollision();
    });
    
    checkCollision();
    
    if (player.ismovingRight) player.moveRight();
    if (player.ismovingLeft) player.moveLeft();
    if (player.isgoingtoJump) player.jump();
    if (player.isJumping) player.checkJump();
    if (player.isFalling) player.checkFall();
    player.draw();
    
    if ((player.Y+player.height) < 0) {
        jQuery('#level_complete')[0].play();
        player.setPosition(40, height - player.height);
        livello++;
        points += 500;
        
        if (livello > (livelli.length-1)) {
            statusbar.text("Livello: " + livello + " - Punti: " + points);
            GameOver();
        }
        else {
            statusbar.text("Livello: " + (livello+1) + " - Punti: " + points);
            resetTimer();
        }
    }
    
    if (statoGioco) gLoop = setTimeout(gameLoop, 20);
}
gameLoop();



// TOT LIVELLI
function generaGraficaLivello () {
    var totLivelli = 2;
    
    for (i=0; i<totLivelli; i++) {
        livelli[i] = [];
        fragole[i] = [];
    }
    
    generaPiattaforme();
    generaFragole();
}


function generaPiattaforme () {
    
    // Livello 1
    livelli[0].push(new piattaforma(100, 1050, 1));
    livelli[0].push(new piattaforma(200, 800, 1));
    livelli[0].push(new piattaforma(100, 500, 0));
    livelli[0].push(new piattaforma(200, 400, 1));
    livelli[0].push(new piattaforma(300, 200, 0));
    livelli[0].push(new piattaforma(500, 380, 1));
    livelli[0].push(new piattaforma(600, 100, 0));
    livelli[0].push(new piattaforma(100, 100, 0));
    livelli[0].push(new piattaforma(700, 200, 0));
    
    // Livello 2
    livelli[1].push(new piattaforma(100, 1050, 1));
    livelli[1].push(new piattaforma(230, 800, 1));
    livelli[1].push(new piattaforma(400, 500, 0));
    livelli[1].push(new piattaforma(250, 400, 0));
    livelli[1].push(new piattaforma(100, 300, 0));
    livelli[1].push(new piattaforma(300, 250, 0));
    livelli[1].push(new piattaforma(500, 200, 0));
    livelli[1].push(new piattaforma(150, 100, 0));
    livelli[1].push(new piattaforma(600, 100, 0));
    
}



function generaFragole () {
    
    // Livello 1
    fragole[0].push(new strawberry(60, 1100));
    fragole[0].push(new strawberry(200, 600));
    fragole[0].push(new strawberry(350, 500));
    
    // Livello 2
    fragole[1].push(new strawberry(700, 1050));
    fragole[1].push(new strawberry(480, 300));
    
}



function checkCollision (futureX, futureY) {
    var check = false;
    
    if (
        ((futureX != undefined) && (futureX != "")) ||
        ((futureY != undefined) && (futureY != ""))
    ) {
        livelli[livello].forEach(function(e, ind) {
            
            if (
                (futureX < e.x + piattaformaWidth) &&
                (futureX + player.width > e.x) &&
                (futureY + player.height > e.y) &&
                (futureY < e.y + piattaformaHeight)
            ) {
                check = true;
                
                if (player.X > e.x + piattaformaWidth) player.setPosition(e.x, futureY);
                if (player.X < e.x) player.setPosition(e.x + piattaformaWidth, futureY);
                if (player.Y > e.y) player.setPosition(futureX, e.y);
                if (player.Y < e.y + piattaformaHeight) player.setPosition(futureX, e.y + piattaformaHeight);
            }
        });
    }
    else {
        livelli[livello].forEach(function(e, ind) {
            if (
                (player.X < e.x + piattaformaWidth) &&
                (player.X + player.width > e.x) &&
                (player.Y + player.height > e.y) &&
                (player.Y + player.height < e.y + piattaformaHeight)
            ) {
                check = true;
                e.onCollide();
            }
        });
    }
    
    return check;
}



function drawEllipse(ctx, x, y, w, h) {
  var kappa = .5522848;
      ox = (w / 2) * kappa, // control point offset horizontal
      oy = (h / 2) * kappa, // control point offset vertical
      xe = x + w,           // x-end
      ye = y + h,           // y-end
      xm = x + w / 2,       // x-middle
      ym = y + h / 2;       // y-middle

  ctx.beginPath();
  ctx.moveTo(x, ym);
  ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  ctx.closePath();
}



function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == "undefined" ) {
    stroke = false;
  }
  if (typeof radius === "undefined") {
    radius = 5;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (stroke) {
    // bordo
    ctx.stroke();
  }
  if (fill) {
    ctx.fill();
  }        
}



function disegnaNuvole() {
    for (var i = 0; i < n_nuvole; i++) {
        drawEllipse(ctx, nuvole[i][0], nuvole[i][1], nuvole[i][2], nuvole[i][3]);
        ctx.strokeStyle = "none";
        // bordo
        //ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, ' + nuvole[i][5] + ')';
        ctx.fill();
        
        //font_X = 160;
        //font_Y = 20;
        //
        //var centratoX = ((nuvole[i][2] - font_X) / 2) + 10,
        //    centratoY = nuvole[i][3] - ((nuvole[i][3] - font_Y) / 2) - (font_Y / 2);
        //
        //ctx.fillStyle = 'rgba(161, 161, 161, ' + nuvole[i][5] + ')';
        //ctx.font = "16px Arial";
        //ctx.fillText("www.scontoclick.it", nuvole[i][0] + centratoX, nuvole[i][1] + centratoY);
    }
}


function muoviNuvole() {
    for (var i = 0; i < n_nuvole; i++) {
        if (nuvole[i][0] - nuvole[i][2] > width) {
            //the ellipse is under the screen so we change informations about it
            nuvole[i][0] = 0 - nuvole[i][2];
            nuvole[i][1] = Math.random() * (height/2);
            nuvole[i][2] = 200 + (Math.random() * 200);
            nuvole[i][3] = 60 + (Math.random() * 60);
            nuvole[i][4] = 3 + Math.random() * 3;
            nuvole[i][5] = Math.random() / 2;
        } else {
            //move ellipse deltaY pixels down
            nuvole[i][0] += nuvole[i][4];
        }
    }
}



function GameOver () {
    statoGioco = false;
    clearTimeout(gLoop);
    
    stopTimer();
    
    jQuery('#soundtrack')[0].pause();
    jQuery('#soundtrack')[0].currentTime = 0;
    
    jQuery('html, body').animate({scrollTop:0}, 'slow');
    
    setTimeout(function() {
        clear();
        ctx.fillStyle = "Black";
        ctx.font = "20px Arial";
        ctx.fillText("GAME OVER!", width / 2 - 60, 350);
    }, 100);
}


function resetTimer(seconds) {
    if ((seconds == undefined) || (seconds == "")) seconds = lvltimeout;
    jQuery('#timer').countdown('option', {until: seconds});
}
function stopTimer() {
    jQuery('#timer').countdown('option', {until: 0});
}
function pauseTimer() {
    statoGioco = false;
    clearTimeout(gLoop);
    jQuery('#pause-resume').css('background-image', "url('img/play.png')");
    jQuery('#timer').countdown('pause');
}
function resumeTimer() {
    statoGioco = true;
    gLoop = setTimeout(gameLoop, 20);
    jQuery('#pause-resume').css('background-image', "url('img/pause.png')");
    jQuery('#timer').countdown('resume');
}


function clear () {
    ctx.fillStyle = '#d0e7f9';
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.closePath();
    ctx.fill();
}