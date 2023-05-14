
var Component = fabric.util.createClass({
    initialize: function (left,top,width,height,isFloating) {
        this.outterCoords={x:0,y:0,width:0,height:0}; // Coordenadas respecto a su padre
        this.innerCoords={x:0,y:0,width:0,height:0}; // Coordenadas del plano interno, para con sus hijos

        this.isActive=true; // nether  performs any logic if mouse events occurs, nor gets render, nor forwards events or render command to children
        this.isInteractable=true;// doesnt perform any logic if mouse events accurs
        this.isFloating=false; // if true, his parent doesnt take it into accout in the method childrenHaveMutated() and is located according to the outter coords of his parent (0,0)

        this.children=[];
        this.parent=null; //used just to pass applicable events (dimentions changed)

        this.isPressed=false;
        this.hasBeenDragged=false;
        this.indexDraggedChild=-1; // if a child is being dragged we want it to the rendered in front of all childs. This variables stores de index of the child being dragged

        //Initialization starts

        this.isFloating=isFloating;

        this.outterCoords.x=left;
        this.outterCoords.y=top;
        this.outterCoords.width=width;
        this.outterCoords.height=height;

        this.innerCoords.x=0;
        this.innerCoords.y=0;
        this.innerCoords.width=width;
        this.innerCoords.height=height;

    },
    /*Called after tree has being generated*/
    backwardConnect(parent){
        this.parent=parent;
    },


    /*Triggered always by a child (except when a child is added or removed): sets up inner dims based on the children's outter coords AND positions children according to a certain behaviour */
    /*
    arg "skipParentNotification" : will be true when called from a sub clase, because then will want to do things with the new values before rolling back changes in the tree
    arg "shouldRender": will be passed along until reaching the root node, there, if false, will skip call to renderAll
    arg "skipChildNotification:false" : if true, the method will not notify dims changed to children (only FlexibleWidgets do something then that event occurs)
    */
    childrenHaveMutated:function(skipParentNotification=false,shouldRender=true, skipChildNotification=false){
    },
    _mouseInBoundingBox: function (e) {
        if(this.isFloating){
            return e.outterClientX >= this.outterCoords.x &&
                e.outterClientX <= this.outterCoords.x + this.outterCoords.width &&
                e.outterClientY >= this.outterCoords.y &&
                e.outterClientY <= this.outterCoords.y + this.outterCoords.height;
        }else{
            return e.innerClientX >= this.outterCoords.x &&
                e.innerClientX <= this.outterCoords.x + this.outterCoords.width &&
                e.innerClientY >= this.outterCoords.y &&
                e.innerClientY <= this.outterCoords.y + this.outterCoords.height;
        }

    },
    onMouseDragStarted: function (e) {

    },
    onMouseDragging: function (e) {
    },
    onMouseClick: function (e) {
    },
    onMouseFixedClick: function (e) {/*click without dragging*/

    },
    onMouseDown: function (e) {

    },
    onMouseDragEnded: function (e) {
    },

    // _transformMousePos:function(e){
    //     e.outterClientX-=this.outterCoords.x;
    //     e.outterClientY-=this.outterCoords.y;
    // },
    _transformMousePos:function(e){
        if(this.isFloating){
            e.outterClientX=e.outterClientX-this.outterCoords.x;
            e.outterClientY=e.outterClientY-this.outterCoords.y;
        }else{
            e.outterClientX=e.innerClientX-this.outterCoords.x;
            e.outterClientY=e.innerClientY-this.outterCoords.y;
        }

    },
    _invertTransformationMousePos:function(e,tmpCopyOutterMouseX,tmpCopyOutterMouseY){
        e.outterClientX=tmpCopyOutterMouseX;
        e.outterClientY=tmpCopyOutterMouseY;
    },
    _transformMouseInnerPos:function(e){
        if(this.isFloating){
            e.innerClientX=e.outterClientX-this.innerCoords.x;
            e.innerClientY=e.outterClientY-this.innerCoords.y;
        }else{
            e.innerClientX=e.outterClientX-this.innerCoords.x;
            e.innerClientY=e.outterClientY-this.innerCoords.y;
        }

    },
    _invertTransformationMouseInnerPos:function(e,tmpCopyInnerMouseX,tmpCopyInnerMouseY){
            e.innerClientX=tmpCopyInnerMouseX;
            e.innerClientY=tmpCopyInnerMouseY;
    },

    notificationOnMouseMove: function (e) {
        //if(isNaN(e.outterClientX)){throw "error: e.outerClientX no puede ser NAN"}
        //if(isNaN(e.outterClientY)){throw "error: e.outerClientY no puede ser NAN"}
        if (!this.isActive) {
            return false;
        }
        if(this.passNotificationOnMouseMoveToChildren(e)){
            return true;
        }
        if(!this.isInteractable){return false;}

        if (this.isPressed) {
            if (!this.hasBeenDragged) {
                this.onMouseDragStarted(e);
            }else{
                this.onMouseDragging(e);
            }
            this.hasBeenDragged = true;

            return true;
        }
        return false;
    },
    notificationOnMouseDown: function (e) {

        if (!this.isActive) {return false;}

        if(!this.isInteractable){return false;}

        if (this._mouseInBoundingBox(e)) {
            if(this.passNotificationOnMouseDownToChildren(e)){ //¿did child consummed the event?
                return true;
            }
            this.isPressed = true;
            this.onMouseDown(e);
            return true;
        }
        return false;
    },
    notificationOnMouseUp: function (e) {
        if (!this.isActive) {return false;}
        if(this.passNotificationOnMouseUpToChildren(e)){
            return true;
        }
        if(!this.isInteractable){return false;}

        let flag=false;
        if (this._mouseInBoundingBox(e)) {
            if (this.isPressed) {
                this.onMouseClick(e);
                if (!this.hasBeenDragged) {
                    this.onMouseFixedClick(e);
                }
                flag=true;
            }
        }
        if (this.isPressed && this.hasBeenDragged) {
            this.onMouseDragEnded(e);
            flag=true;
        }

        this.hasBeenDragged = false;
        this.isPressed = false;

        return flag;
    },
    passNotificationOnMouseDownToChildren(e){
        //console.log(this.id + ":("+e.outterClientX+","+e.outterClientY+"), (" + e.innerClientX+","+e.innerClientY+")"  + this.children.length);
        let tmpCopyOutterMouseX=e.outterClientX;
        let tmpCopyOutterMouseY=e.outterClientY;
        let tmpCopyInnerMouseX=e.innerClientX;
        let tmpCopyInnerMouseY=e.innerClientY;
        this._transformMousePos(e);
        this._transformMouseInnerPos(e);

        for(let i=this.children.length-1;i>=0;i--){
            if(this.children[i].notificationOnMouseDown(e)){
                this._invertTransformationMousePos(e,tmpCopyOutterMouseX,tmpCopyOutterMouseY);
                this._invertTransformationMouseInnerPos(e,tmpCopyInnerMouseX,tmpCopyInnerMouseY);
               return true;
            }
        }
        this._invertTransformationMousePos(e,tmpCopyOutterMouseX,tmpCopyOutterMouseY);
        this._invertTransformationMouseInnerPos(e,tmpCopyInnerMouseX,tmpCopyInnerMouseY);
        return false;
    },
    passNotificationOnMouseUpToChildren(e){
        let tmpCopyOutterMouseX=e.outterClientX;
        let tmpCopyOutterMouseY=e.outterClientY;
        let tmpCopyInnerMouseX=e.innerClientX;
        let tmpCopyInnerMouseY=e.innerClientY;
        this._transformMousePos(e);
        this._transformMouseInnerPos(e);
        for(let i=this.children.length-1;i>=0;i--){
            if(this.children[i].notificationOnMouseUp(e)){
                this._invertTransformationMousePos(e,tmpCopyOutterMouseX,tmpCopyOutterMouseY);
                this._invertTransformationMouseInnerPos(e,tmpCopyInnerMouseX,tmpCopyInnerMouseY);
                return true;
            }
        }
        this._invertTransformationMousePos(e,tmpCopyOutterMouseX,tmpCopyOutterMouseY);
        this._invertTransformationMouseInnerPos(e,tmpCopyInnerMouseX,tmpCopyInnerMouseY);
        return false;
    },
    passNotificationOnMouseMoveToChildren(e){
        //console.log(this.id + ":("+e.outterClientX+","+e.outterClientY+"), (" + e.innerClientX+","+e.innerClientY+")"   + this.children.length );
        let tmpCopyOutterMouseX=e.outterClientX;
        let tmpCopyOutterMouseY=e.outterClientY;
        let tmpCopyInnerMouseX=e.innerClientX;
        let tmpCopyInnerMouseY=e.innerClientY;
        this._transformMousePos(e);
        this._transformMouseInnerPos(e);
        for(let i=this.children.length-1;i>=0;i--){
            if(this.children[i].notificationOnMouseMove(e)){
                this._invertTransformationMousePos(e,tmpCopyOutterMouseX,tmpCopyOutterMouseY);
                this._invertTransformationMouseInnerPos(e,tmpCopyInnerMouseX,tmpCopyInnerMouseY);
                return true;
            }
        }
        this._invertTransformationMousePos(e,tmpCopyOutterMouseX,tmpCopyOutterMouseY);
        this._invertTransformationMouseInnerPos(e,tmpCopyInnerMouseX,tmpCopyInnerMouseY);
        return false;
    },

    notifyParentOnDragStarted(){
        if(this.parent){
            this.parent.childNotificationOnDragStarted(this);
        }
    },
    notifyParentOnDragEnded(){
        if(this.parent){
            this.parent.childNotificationOnDragEnded(this);
        }
    },

    childNotificationOnDragStarted(obj){
        let childIndex=this.children.indexOf(obj);
        if(childIndex!=-1){
            this.indexDraggedChild=childIndex;
        }
    },
    childNotificationOnDragEnded(obj){
        let childIndex=this.children.indexOf(obj);
        if(childIndex!=-1){
            if(childIndex!=this.indexDraggedChild){alert("error terrrible");}
            this.indexDraggedChild=-1;
        }
    }
});
let Widget=fabric.util.createClass(Component,{
    initialize:function(id,canvas,width,height,fillColor,children,isFloating){
        this.callSuper("initialize",0,0,width,height,isFloating);
        this.id=id;
        this.canvas=canvas; //Used only to command render
        this.fill=fillColor;
        this.mouse2positionOffset={x:0,y:0};        // used for dragging behaviour
        this._isBeingDragged=false;                  // if true, his parent doesnt take it into accout in the method childrenHaveMutated()
        this._isPressed=false;
        this._addChildren(children);
    },
    /*called only by constructor, used for when children are passed at initialization*/
    _addChildren(listChildren){
        this.children=listChildren;
        for(let i=0;i<this.children.length;i++){
            this.children[i].backwardConnect(this);
        }

        this.childrenHaveMutated(true,false,true);
    },
    addChild(child,pos=-1){
        child.backwardConnect(this);
        if(pos!=-1){
            this.children.splice(pos,0,child);
        }else{
            this.children.push(child);
        }

        if(!child.isFloating){
            this.childrenHaveMutated();
        }else{
            this.canvas && this.canvas.renderAll();
        }
    },
    removeChildAt(pos){
        let deleted=this.children.splice(pos,1);

        if(!deleted[0].isFloating){
            this.childrenHaveMutated()
        }else{
            this.canvas && this.canvas.renderAll();
        }
    },
    setWidth:function(width){
        this.outterCoords.width= width;

        if(!this.isFloating && !this.isBeingDragged){
            this.childrenHaveMutated();
        }else{
            this.canvas && this.canvas.renderAll();
        }
    },
    setHeight:function(height){
        this.outterCoords.height= height;

        if(!this.isFloating && !this.isBeingDragged){
            this.childrenHaveMutated();
        }else{
            this.canvas && this.canvas.renderAll();
        }
    },
    _setDraggingState:function(state){
        this.isBeingDragged=state;
    },
    setOutterPos:function(x,y){
        //if(isNaN(x)){throw "error: position X cannot be nan";}
        //if(isNaN(y)){throw "error: position Y cannot be nan";}
        if(x){this.outterCoords.x=x;}
        if(y){this.outterCoords.y=y;}

        if(!this.isFloating && !this.isBeingDragged){
            //this.childrenHaveMutated();
        }else{
            this.canvas && this.canvas.renderAll();
        }
    },

    getWidth:function(){
        return this.outterCoords.width;
    },
    getHeight:function(){
        return this.outterCoords.height;
    },

    onMouseDragStarted: function (e) {
        if(this.isFloating){
            this.mouse2positionOffset.x=e.outterClientX-this.outterCoords.x;
            this.mouse2positionOffset.y=e.outterClientY-this.outterCoords.y;
        }else{

            this.mouse2positionOffset.x=e.innerClientX-this.outterCoords.x;
            this.mouse2positionOffset.y=e.innerClientY-this.outterCoords.y;
        }
        this._setDraggingState(true);

        if(!this.isFloating){
            this.notifyParentOnDimsChanged(false);
        }else{
            this.canvas && this.canvas.renderAll();
        }

        this.notifyParentOnDragStarted();
    },
    onMouseDragging: function (e) {
        if(this.isFloating){
            this.setOutterPos(e.outterClientX-this.mouse2positionOffset.x,e.outterClientY-this.mouse2positionOffset.y)
        }else{
            this.setOutterPos(e.innerClientX-this.mouse2positionOffset.x,e.innerClientY-this.mouse2positionOffset.y)
        }
    },
    onMouseDragEnded: function (e) {
        this.notifyParentOnDragEnded();
        this._setDraggingState(false);

        if(!this.isFloating){
            this.notifyParentOnDimsChanged(true);
        }else{
            this.canvas && this.canvas.renderAll();
        }
    },
    onMouseClick: function (e) {

    },
    onMouseFixedClick: function (e) {/*click without dragging*/

    },
    onMouseDown: function (e) {

    },
    /*
        arg "skipNotificationToParent" : will be true in 2 cases: when called from a sub clase, because then will want to do things with the new values before rolling back changes in the tree. AND in the methods _addChildren, porque no queremos propagar, solo aplicar el metodo para este widgets
        arg "shouldRender": will be passed along until reaching the root node. There, if false, will skip call to renderAll. Util unicamente en el evento onmousedragstarted, para evitar que el elemnto se posicione incorrectamente (era un bug que me todomo horas resolver)
    */
    childrenHaveMutated:function(skipNotificationToParent=false,shouldRender=true,skipChildNotification=false){
        //console.log(this.id + ":" + skipNotificationToParent + " , " + skipChildNotification);
        let totalHeight=0;
        let totalWidth=0;
        let maxWidth=-1;
        let maxHeight=-1;
        let tmpChild=null;
        //console.log(this.children.length);
        for(let i=0;i<this.children.length;i++){
            tmpChild=this.children[i];
            if(tmpChild.isFloating || tmpChild.isBeingDragged || !tmpChild.isActive){continue;}
            // notifying children dimensions
            !skipChildNotification && this.notifyChildOnDimsChanged(i);
            // Arranging children vertically
            this._arrengementBehaviour(i,maxWidth,maxHeight,totalWidth,totalHeight)

            // Calculating new width and height
            totalHeight+=tmpChild.outterCoords.height;
            totalWidth+=tmpChild.outterCoords.width;
            if(tmpChild.outterCoords.width>maxWidth){
                maxWidth=tmpChild.outterCoords.width;
            }
            if(tmpChild.outterCoords.height>maxHeight){
                maxHeight=tmpChild.outterCoords.height;
            }
        }

        this._sizingBehaviour(maxWidth,maxHeight,totalWidth,totalHeight);


        if(skipNotificationToParent){
            shouldRender && this.canvas && this.canvas.renderAll();
            return;
        }

        if(!this.isFloating){
                this.notifyParentOnDimsChanged(shouldRender);
        }else{
            shouldRender && this.canvas && this.canvas.renderAll();
        }
    },
    _arrengementBehaviour:function(childIndex,maxWidth,maxHeight,totalWidth,totalHeight){
        this.children[childIndex].outterCoords.x=0;
        this.children[childIndex].outterCoords.y=totalHeight;
    },
    _sizingBehaviour:function(maxWidth,maxHeight,totalWidth,totalHeight){
        this.innerCoords.width=maxWidth<this.outterCoords.width?this.outterCoords.width:maxWidth;
        this.innerCoords.height=totalHeight<this.outterCoords.height?this.outterCoords.height:totalHeight;
    },
    /* Widgets that size according to parents dimensions will implement this function (FlexibleWidget Class ), for now, all widgets will just pass along the propagation, so that if this child no direct "resizable" child, but there are those types of widgets further down the herarchy, the notification can get to them*/
    parentDimsChanged:function(outterWidth,outterHeight,innerWidth,innerHeight){
        for(let i=0;i<this.children.length;i++){
            // notifying children dimensions
            this.notifyChildOnDimsChanged(i);
        }
    },

    render:function(ctx){
        if(!this.isActive){return;}
        ctx.save();
        ctx.fillStyle=this.fill;
        ctx.transform(1,0,0,1,this.outterCoords.x,this.outterCoords.y);
        ctx.beginPath();
        ctx.rect(0,0,this.outterCoords.width,this.outterCoords.height);
        ctx.clip();
        ctx.fillRect(0,0,this.outterCoords.width,this.outterCoords.height);

        for(let i=0;i<this.children.length;i++){
            if(!this.children[i].isFloating){
                ctx.transform(1,0,0,1,this.innerCoords.x,this.innerCoords.y);
                this.children[i].render(ctx);
                ctx.transform(1,0,0,1,-this.innerCoords.x,-this.innerCoords.y);
            }else{
                this.children[i].render(ctx);
            }
        }
        if(this.indexDraggedChild!=-1){
            if(!this.children[this.indexDraggedChild].isFloating){
                ctx.transform(1,0,0,1,this.innerCoords.x,this.innerCoords.y);
                this.children[this.indexDraggedChild].render(ctx);
                ctx.transform(1,0,0,1,-this.innerCoords.x,-this.innerCoords.y);
            }else{
                this.children[this.indexDraggedChild].render(ctx);
            }
        }

        ctx.restore();

    },
    parentNotificationOnDimsChanged:function(outterWidth,outterHeight,innerWidth,innerHeight){
        this.parentDimsChanged(outterWidth,outterHeight,innerWidth,innerHeight);
    },
    childNotificationOnDimsChanged(skipNotificationToParent,shouldRender,skipChildNotification){
        this.childrenHaveMutated(true,shouldRender,true);
    },

    notifyChildOnDimsChanged:function(childIndex){
        this.children[childIndex].parentNotificationOnDimsChanged(
            this.outterCoords.width,
            this.outterCoords.height,
            this.innerCoords.width,
            this.innerCoords.height
        );
    },

    notifyParentOnDimsChanged(shouldRender){
        let self=this;
        if(this.parent){ // in case widget is the root
            this.parent.childNotificationOnDimsChanged(true,shouldRender,true);
        }else{
            shouldRender && this.canvas && this.canvas.renderAll();
        }
    },

})
/*
*  * Se lo inizializa en un metodo aparte y no en el constructor, por motivos de hacer las reuzable el widget que usa a este widget
* */
let ScrollBarWidget=fabric.util.createClass(Widget,{
    initialize:function(id,thickness,extraMovementGap,children){
        this.extraMovementGap=extraMovementGap;
        this.margin=0;
        this.maxWidth=0;
        this.maxHeight=0;
        this.callSuper("initialize",id,null,thickness,thickness,"#ff00ff",children,true);
    },

    setWidth:function(value){
        //console.log(value + ": " + this.maxWidth)
        if(Math.round(value)==this.maxWidth){
            this.isActive=false;
        }else{
            this.isActive=true;
        }
        this.callSuper("setWidth",value);
    },
    setHeight:function(value){
        if(Math.round(value)==this.maxHeight){
            this.isActive=false;
        }else{
            this.isActive=true;
        }
        this.callSuper("setHeight",value);
    },
    setMaxWidthFromParentOutterWidth:function(value){
        this.maxWidth=Math.round(value-this.margin*2-this.extraMovementGap)
    },
    setMaxHeightFromParentOutterHeight:function(value){
        this.maxHeight=Math.round(value-this.margin*2-this.extraMovementGap)
    },
    getMaxWidth:function(value){
        return this.maxWidth;
    },
    getMaxHeight:function(value){
        return this.maxHeight;
    },
    setPadding:function(value){;
        this.margin=value;
    },
    getPadding:function(){
        return this.margin;
    },
    setExtraMovementGap:function(val){
        return this.extraMovementGap=val;
    },
    getExtraMovementGap:function(){
        return this.extraMovementGap;
    },
    onMouseDragging: function (e) {
        this.notifyParentOnMouseDragging(e);
    },
    notifyParentOnMouseDragging:function(e){
        this.parent.childNotificationOnXScrollMouseDragging(e,this.mouse2positionOffset,this.id);
    },
    constraintMovementInX:function(rightLimit){
        console.log(this.id);
        if(this.outterCoords.x<this.margin){console.log("entro");this.outterCoords.x=this.margin;}
        if(this.outterCoords.x+this.outterCoords.width>(rightLimit-this.margin-this.extraMovementGap)){this.outterCoords.x=rightLimit-this.outterCoords.width-this.margin-this.extraMovementGap;}

    },
    constraintMovementInY:function(bottomLimit){
        if(this.outterCoords.y<this.margin){this.outterCoords.y=this.margin;}
        if(this.outterCoords.y+this.outterCoords.height>(bottomLimit-this.margin-this.extraMovementGap)){this.outterCoords.y=bottomLimit-this.outterCoords.height-this.margin-this.extraMovementGap;}
    },
    /*Used by parent if this is a x scroll*/
    getOutterCoordX:function(){
        return this.outterCoords.x;
    },
    /*Used by parent if this is a y scroll*/
    getOutterCoordY:function(){
        return this.outterCoords.y;
    }
});

let ScrollableWidget=fabric.util.createClass(Widget,{
    initialize:function(id,canvas,width,height,fillColor,children,isFloating=false){
        this.scrollPaddingFactor=0.03;
        this.scrollThick=13;
        this.scrollGap2Border=2;
        this.scrollX=null;
        this.scrollY=null;
        this.initScrollWidgets();
        children.push(this.scrollX);
        children.push(this.scrollY);
        this.callSuper("initialize",id,canvas,width,height,fillColor,children,isFloating);
        // By this point (the supperclass constructor did so), children cords and current widget dims should have already being calculated

    },
    initScrollWidgets:function(){
        this.scrollX=new ScrollBarWidget("scrollX",this.scrollThick,0,[]);
        this.scrollY=new ScrollBarWidget("scrollY",this.scrollThick,this.scrollThick,[]);
    },
    addChild(child,pos){
        this.callSuper("addChild",child,this.children.length-2);
    },
    childrenHaveMutated:function(skipNotificationToParent=false,shouldRender=true,skipChildNotification=false){
        this.callSuper("childrenHaveMutated",true,false,skipChildNotification);
        //updating sate of scrollbars
        this.scrollX.setPadding(this.outterCoords.width*this.scrollPaddingFactor);
        this.scrollY.setPadding(this.outterCoords.height*this.scrollPaddingFactor);
        this.scrollX.outterCoords.y=this.outterCoords.height-this.scrollThick-this.scrollGap2Border;
        this.scrollY.outterCoords.x=this.outterCoords.width-this.scrollThick-this.scrollGap2Border;
        this.scrollX.setMaxWidthFromParentOutterWidth(this.outterCoords.width);
        this.scrollY.setMaxHeightFromParentOutterHeight(this.outterCoords.height);
        this.scrollX.outterCoords.width=
            (
                (this.outterCoords.width/this.innerCoords.width) *
                this.outterCoords.width-this.scrollX.getExtraMovementGap()
            ) -this.scrollX.getPadding()*2

        this.scrollY.outterCoords.height=
            (
                (this.outterCoords.height/this.innerCoords.height) *
                this.outterCoords.height-this.scrollY.getExtraMovementGap()
            )-this.scrollY.getPadding()*2

        this.scrollX.constraintMovementInX(this.outterCoords.width);
        this.scrollY.constraintMovementInY(this.outterCoords.height);

        this.innerCoords.x=-(
            (this.scrollX.getOutterCoordX()-this.scrollX.getPadding()) /
            (this.outterCoords.width)) *
            this.innerCoords.width;
        this.innerCoords.y=-(
            (this.scrollY.getOutterCoordY()-this.scrollY.getPadding()) /
            (this.outterCoords.height)) *
            this.innerCoords.height;

        //From here Same as the parent
        if(skipNotificationToParent){
            shouldRender && this.canvas && this.canvas.renderAll();
            return;
        }

        if(!this.isFloating){
            this.notifyParentOnDimsChanged(shouldRender);
        }else{
            shouldRender && this.canvas && this.canvas.renderAll();
        }
    },
    childNotificationOnXScrollMouseDragging:function(e,mouse2positionOffset,id){
        if(id==="scrollX"){
            this.scrollX.setOutterPos(e.outterClientX-mouse2positionOffset.x,this.outterCoords.height-this.scrollThick-this.scrollGap2Border);
            this.scrollX.constraintMovementInX(this.outterCoords.width);
            this.innerCoords.x=-(
                (this.scrollX.getOutterCoordX()-this.scrollX.getPadding()) /
                (this.outterCoords.width)) *
                this.innerCoords.width;
        }else if(id==="scrollY"){
            this.scrollY.setOutterPos(this.outterCoords.width-this.scrollThick-this.scrollGap2Border,e.outterClientY-mouse2positionOffset.y);
            this.scrollY.constraintMovementInY(this.outterCoords.height);
            this.innerCoords.y=-(
                (this.scrollY.getOutterCoordY()-this.scrollY.getPadding()) /
                (this.outterCoords.height)) *
                this.innerCoords.height;
        }
        this.canvas.renderAll(); // Posible mejora: Hacer que se empieze a renderizar solo desde este mismo widget hacia abajo (hijos, mas no padres de este)
    },
});
/* Starting from Widget, this class adds the behaviour of adjusting its size accourding to its children*/
let ColumnWidget=fabric.util.createClass(Widget,{
    initialize:function(id,canvas,fillColor,children,isFloating=false){
        this.callSuper("initialize",id,canvas,0,0,fillColor,children,isFloating);
    },
    childrenHaveMutated:function(skipNotificationToParent,shouldRender=true,skipChildNotification=false){
        this.callSuper("childrenHaveMutated",true,false,skipChildNotification);
        // if(skipNotificationToParent){
        //     shouldRender && this.canvas && this.canvas.renderAll();
        //     return;
        // }

        if(!this.isFloating){
            this.notifyParentOnDimsChanged(shouldRender);
        }else{
            shouldRender && this.canvas && this.canvas.renderAll();
        }
    },

    _sizingBehaviour:function(maxWidth,maxHeight,totalWidth,totalHeight){
        this.innerCoords.width=maxWidth;
        this.innerCoords.height=totalHeight;

        this.outterCoords.width=this.innerCoords.width;
        this.outterCoords.height=this.innerCoords.height;
    },
});
/* Starting from ColumnWidget, this class adds the behaviour of arrenging children horizontally and sizing according to accumulated width of children and max height of children*/
let RowWidget=fabric.util.createClass(ColumnWidget,{
    initialize:function(id,canvas,fillColor,children,isFloating=false){
        this.callSuper("initialize",id,canvas,fillColor,children,isFloating);
    },
    _arrengementBehaviour:function(childIndex,maxWidth,maxHeight,totalWidth,totalHeight){
        this.children[childIndex].outterCoords.x=totalWidth;
        this.children[childIndex].outterCoords.y=0;
    },
    _sizingBehaviour:function(maxWidth,maxHeight,totalWidth,totalHeight){
        this.innerCoords.width=totalWidth;
        this.innerCoords.height=maxHeight;

        this.outterCoords.width=this.innerCoords.width;
        this.outterCoords.height=this.innerCoords.height;
    },
});

let FlexibleWidget=fabric.util.createClass(Widget,{
    initialize:function(id,canvas,width,height,widthPercent,heightPercent,fillColor,children,arrengementDirection="ver",basedOnOutterCoords=true){
        this.widthPercent=widthPercent;
        this.heightPercent=heightPercent;
        this.basedOnOutterCoords=basedOnOutterCoords; // determines if the sizing has to be according to inner or outter dims of parent
        this.arrengementDirection=arrengementDirection;
        this.parentOutterWidth=0;
        this.parentOutterHeight=0;
        this.parentInnerWidth=0;
        this.parentInnerHeight=0;
        this.callSuper("initialize",id,canvas,width,height,fillColor,children,false);
        // By this point (the supperclass constructor did so), children cords and current widget dims should have already being calculated
    },
    /*overriten*/
    _addChildren(listChildren){
        this.children=listChildren;

        for(let i=0;i<this.children.length;i++){
            this.children[i].backwardConnect(this);
        }
        //this.childrenHaveMutated(true,false,true); // SAVING (VERRY LITTLE) CPU AT START. GIVEN THAT FLEXIBLEWIDGET DIMENTIONS ARE NOT CALCULATED YET, doesnt make sense calling this method because positions would be wrong
    },
    /*overriten*/
    setWidth:function(value){
        if(this.widthPercent==null){ // skips because width is calculated automatically and cannot be changed by outsiders
            this.callSuper("setWidth",value);
        }
    },
    /*overriten*/
    setHeight:function(value){
        if(this.heightPercent==null){ // skips because height is calculated automatically and cannot be changed by outsiders
            this.callSuper("setHeight",value);
        }
    },
    setWidthPercent:function(value){
        this.widthPercent=value;
        this._calcNewSizes();
        this.childrenHaveMutated();
    },
    setHeightPercent:function(value){
        this.heightPercent=value;
        this._calcNewSizes();
        this.childrenHaveMutated();
    },
    /*overriten*/
    _arrengementBehaviour:function(childIndex,maxWidth,maxHeight,totalWidth,totalHeight){
        if(this.arrengementDirection=="ver"){
            this.callSuper("_arrengementBehaviour",childIndex,maxWidth,maxHeight,totalWidth,totalHeight);
        }else{
            this.children[childIndex].outterCoords.x=totalWidth;
            this.children[childIndex].outterCoords.y=0;
        }
    },
    /*overriten*/
    _sizingBehaviour:function(maxWidth,maxHeight,totalWidth,totalHeight) {
        //Nada
    },

    /*overriten*/
    parentDimsChanged:function(outterWidth,outterHeight,innerWidth,innerHeight){
        this.parentOutterWidth=outterWidth;
        this.parentOutterHeight=outterHeight;
        this.parentInnerWidth=innerWidth;
        this.parentInnerHeight=innerHeight;
        this._calcNewSizes();
        this.childrenHaveMutated(true,false,false); // only case when skip parent and skip child go with different values (true, false), bc here we only want to update this widget and its children
    },
    _calcNewSizes:function(){
        if(this.basedOnOutterCoords){
            if(this.widthPercent!=null){
                this.outterCoords.width=this.parentOutterWidth*(this.widthPercent/100);
            }
            if(this.heightPercent!=null){
                this.outterCoords.height=this.parentOutterHeight*(this.heightPercent/100);
            }
        }else{
            if(this.widthPercent!=null){
                this.outterCoords.width=this.parentInnerWidth*(this.widthPercent/100);
            }
            if(this.heightPercent!=null){
                this.outterCoords.height=this.parentInnerHeight*(this.heightPercent/100);
            }
        }
    }

});

/*END LIBRARY*/
/*
* TUTORIAL:
* * Every type of widget can be parent or child of every type of widget, with exception to RowWidget, ColumnWidget and FlexibleWidget. The latter cannot be child of any of the first two, because FlexibleWidget need a parent with a fixed dimension
* */
let ScrollBarButton=fabric.util.createClass(Widget,{
    initialize:function(id,width,height){
        this.callSuper("initialize",id,null,width,height,"#000000",[],true);
    },
    /*overriten (nunca querremos que este widget mande a renderizar)*/
    setOutterPos:function(x,y){
        if(x){this.outterCoords.x=x;}
        if(y){this.outterCoords.y=y;}

        // if(!this.isFloating && !this.isBeingDragged){
        //     //this.childrenHaveMutated();
        // }else{
        //     this.canvas && this.canvas.renderAll();
        // }
    },
    /*overriten*/
    onMouseDragging: function (e) {
        this.notifyParentOnMouseDragging(e);
    },
    notifyParentOnMouseDragging:function(e){
        this.parent.childNotificationOnButtonDragging(e,this.mouse2positionOffset,this.id);
    },
    constraintMovementInX:function(leftLimit,rightLimit){
        if(this.outterCoords.x<leftLimit){this.outterCoords.x=leftLimit;}
        if(this.outterCoords.x+this.outterCoords.width>rightLimit){this.outterCoords.x=rightLimit-this.outterCoords.width}
    },
    constraintMovementInY:function(upperLimit,bottomLimit){
        if(this.outterCoords.y<upperLimit){this.outterCoords.y=upperLimit;}
        if(this.outterCoords.y+this.outterCoords.height>bottomLimit){this.outterCoords.y=bottomLimit}
    },
    /*Used by parent if this is a x scroll*/
    getOutterCoordX:function(){
        return this.outterCoords.x;
    },
    /*Used by parent if this is a y scroll*/
    getOutterCoordY:function(){
        return this.outterCoords.y;
    }
});
let StretchableXScrollBarWidget=fabric.util.createClass(ScrollBarWidget,{
    initialize:function(id,thickness,extraMovementGap,children){
        this.btnA=null;
        this.btnB=null;
        this._initButtonWidgets(thickness);
        children.push(this.btnA);
        children.push(this.btnB);
        this.callSuper("initialize",id,thickness,extraMovementGap,children);
    },
    _initButtonWidgets:function(thickness){
        this.btnA=new ScrollBarButton("btnA",thickness,thickness);
        this.btnB=new ScrollBarButton("btnB",thickness,thickness);
    },
    initWidth:function(){
        this.outterCoords.width= this.maxWidth;
        this.btnA.setOutterPos(0,0);
        this.btnB.setOutterPos(this.outterCoords.width-this.btnB.outterCoords.width,0);
    },
    /*overriten*/
    setWidth:function(value){
        this.outterCoords.width=value;
        // Vacio, dado que no queremos que su tamaño se extablezca en base al contenido de su padre, y cuando su padre intente hacerlo, no haremos nada
    },
    updateButtonsPosition:function(){
        this.btnA.setOutterPos(0,0);
        this.btnB.setOutterPos(this.outterCoords.width-this.btnB.outterCoords.width,0);
    },
    /*overriten*/
    // setHeight:function(value){
    //     this.outterCoords.height= value;
    //     if(!this.childrenDisplacementAxis){
    //         this.btnA.setOutterPos(0,0);
    //         this.btnB.setOutterPos(0,this.outterCoords.height-this.btnB.outterCoords.height);
    //     }
    // },
    /*Para este widget, dado que es un flotante, este metodo solo se llamara SOLO UNA VEZ, en inicializacion comienzo*/
    // childrenHaveMutated:function(skipNotificationToParent=false,shouldRender=true,skipChildNotification=false){
    //     this.callSuper("childrenHaveMutated",true,false,skipChildNotification);
    //     //console.log("1 VEZ!!!!");
    //     //updating position of buttons
    //     this.updateButtonsPosition();
    //
    //
    //     //From here Same as the parent
    //     if(skipNotificationToParent){
    //         shouldRender && this.canvas && this.canvas.renderAll();
    //         return;
    //     }
    //     if(!this.isFloating){
    //         this.notifyParentOnDimsChanged(shouldRender);
    //     }else{
    //         shouldRender && this.canvas && this.canvas.renderAll();
    //     }
    // },

    childNotificationOnButtonDragging:function(e,mouse2positionOffset,id){
            if(id==="btnA"){
                this.btnA.outterCoords.x=e.outterClientX-mouse2positionOffset.x
                this.btnA.outterCoords.y=0;
                this.btnA.constraintMovementInX(-this.outterCoords.x+this.margin,this.btnB.outterCoords.x-this.margin*3);
                this.outterCoords.width=this.btnB.outterCoords.x+this.btnB.outterCoords.width-this.btnA.outterCoords.x;
                this.outterCoords.x+=this.btnA.getOutterCoordX();
                this.btnB.outterCoords.x-=this.btnA.getOutterCoordX();
                this.btnA.outterCoords.x=0;
            }else{
                this.btnB.outterCoords.x=e.outterClientX-mouse2positionOffset.x
                this.btnB.outterCoords.y=0;
                this.btnB.constraintMovementInX(this.btnA.outterCoords.x+this.btnA.outterCoords.width+this.margin*3,(this.maxWidth+this.margin)-this.outterCoords.x);
                this.outterCoords.width=this.btnB.outterCoords.x+this.btnB.outterCoords.width-this.btnA.outterCoords.x;
            }
        this.notifyParentOnLengthChanged();
    },
    notifyParentOnLengthChanged:function(){
        this.parent.childNotificationOnXScrollLengthChanged(this.outterCoords.width,this.maxWidth);
    }

});
/*
* a diferencia de Scrollable Widget, este, sus dimenciones internas, no se calculan automaticamente en base a su contenido, si no que las puede controlar el usuario con los botones de las barras de scroll
* */
let FixedScrollableWidget=fabric.util.createClass(ScrollableWidget, {
    initialize: function (id,canvas,width,height,fillColor,children,isFloating=false) {
        this.callSuper("initialize", id, canvas, width, height, fillColor, children, isFloating);
        //this.scrollX.initWidth();
        // By this point (the supperclass constructor did so), children cords and current widget dims should have already being calculated
    },
    /*overriten*/
    initScrollWidgets:function(){
        this.scrollX=new StretchableXScrollBarWidget("scrollX",this.scrollThick,0,[]);
        this.scrollY=new ScrollBarWidget("scrollY",this.scrollThick,this.scrollThick,[]);
    },
    /*overriten*/
    childrenHaveMutated:function(skipNotificationToParent=false,shouldRender=true,skipChildNotification=false){
        if(this.innerCoords.width<this.outterCoords.width){this.innerCoords.width=this.outterCoords.width} // We need to have the dimmensions before entering the propagation bc of flexible widgets
        this.callSuper("childrenHaveMutated",true,false,skipChildNotification);

        //Update horizontal scroll buttons position, becauase the dimenstions must have changed int he supper class method

        this.scrollX.updateButtonsPosition();

        //From here Same as the parent
        if(skipNotificationToParent){
            shouldRender && this.canvas && this.canvas.renderAll();
            return;
        }

        if(!this.isFloating){
            this.notifyParentOnDimsChanged(shouldRender);
        }else{
            shouldRender && this.canvas && this.canvas.renderAll();
        }
    },
    childrenHaveMutated_ORIGINAL:function(skipNotificationToParent=false,shouldRender=true,skipChildNotification=false){
        let totalHeight=0;
        let totalWidth=0;
        let maxWidth=-1;
        let maxHeight=-1;
        let tmpChild=null;
        for(let i=0;i<this.children.length;i++){
            tmpChild=this.children[i];
            if(tmpChild.isFloating || tmpChild.isBeingDragged || !tmpChild.isActive){continue;}
            // notifying children dimensions
            !skipChildNotification && this.notifyChildOnDimsChanged(i);
            // Arranging children vertically
            this._arrengementBehaviour(i,maxWidth,maxHeight,totalWidth,totalHeight)

            // Calculating new width and height
            totalHeight+=tmpChild.outterCoords.height;
            totalWidth+=tmpChild.outterCoords.width;
            if(tmpChild.outterCoords.width>maxWidth){
                maxWidth=tmpChild.outterCoords.width;
            }
            if(tmpChild.outterCoords.height>maxHeight){
                maxHeight=tmpChild.outterCoords.height;
            }
        }

        // this._sizingBehaviour(maxWidth,maxHeight,totalWidth,totalHeight);
        //
        //
        if(skipNotificationToParent){
            shouldRender && this.canvas && this.canvas.renderAll();
            return;
        }
        //
        // if(!this.isFloating){
        //     this.notifyParentOnDimsChanged(shouldRender);
        // }else{
        //     shouldRender && this.canvas && this.canvas.renderAll();
        // }
    },
    childNotificationOnXScrollLengthChanged:function(newWidth,maxWidth){
        this.innerCoords.x=-(
            (this.scrollX.getOutterCoordX()-this.scrollX.getPadding()) /
            (this.outterCoords.width-this.scrollX.getExtraMovementGap())) *
            this.innerCoords.width;

        this.innerCoords.width=(maxWidth/newWidth)*this.outterCoords.width;

       //this.childrenHaveMutated(true,true,false); // HACEMOS EL SIGUIENTE BLOQUE EN LUGAR DE ESTA LINEA, PORQUE EN EL METODO CHILDRENHAVEMUTATED, SE ESTA ESTABLECIENDO DIMENSIONES  A LOS SCROLLES COSA QUE NO QUEREMOS, SOLO PROPARGAR CAMBIOS
        this.childrenHaveMutated_ORIGINAL(true,true,false);
    },
    /*overriten*/
    _sizingBehaviour:function(maxWidth,maxHeight,totalWidth,totalHeight){
        if(this.innerCoords.width<this.outterCoords.width){this.innerCoords.width=this.outterCoords.width}
        //this.innerCoords.width=maxWidth<this.outterCoords.width?this.outterCoords.width:maxWidth;
        this.innerCoords.height=totalHeight<this.outterCoords.height?this.outterCoords.height:totalHeight;
    },
});
let WidgetTree=fabric.util.createClass({
    HTMLCanvas:null,
    canvasContext:null,
    rootWidget:null,
    treeHasBeenBackConnected:false,
    initialize:function(id){
        this.HTMLCanvas=document.getElementById(id);
        this.canvasContext=this.HTMLCanvas.getContext("2d");
        this.HTMLCanvas.width=window.innerWidth;
        this.HTMLCanvas.height=window.innerHeight;
        this.createWidgetTree();
        this.rootWidget.childrenHaveMutated();

        //this.connetTreeBackwards();
        //this.renderAll();
    },
    createWidgetTree:function(){
        window.tmp=new ScrollableWidget("hijo2",this,200,40,"#378da8",[
            new Widget("hijo2",this,400,20,"#662ad5",[]),
            new Widget("hijo2",this,400,20,"#49aec7",[]),
            new Widget("hijo2",this,400,20,"#83b662",[]),
            new Widget("hijo2",this,300,20,"#d02698",[]),
        ]);
        window.tmp2=new ScrollableWidget("hijo2",this,200,40,"#378da8",[
            new Widget("hijo2",this,400,20,"#662ad5",[]),
            new Widget("hijo2",this,400,20,"#49aec7",[]),
            new Widget("hijo2",this,400,20,"#83b662",[]),
            new Widget("hijo2",this,300,20,"#d02698",[]),
        ]);
        window.tmp3=new ScrollableWidget("hijo2",this,200,40,"#378da8",[
            new Widget("hijo2",this,400,20,"#662ad5",[]),
            new Widget("hijo2",this,400,20,"#49aec7",[]),
            new Widget("hijo2",this,400,20,"#83b662",[]),
            new Widget("hijo2",this,300,20,"#d02698",[]),
        ]);

        window.w= new FixedScrollableWidget("hijo3",this,300,200,"#d02698",[
            new FlexibleWidget("hijo2",this,20,100,100,null,"#672caf",[
                new FlexibleWidget("hijo2",this,20,100,50,null,"#672caf",[

                ],"hor"),
                new FlexibleWidget("hijo2",this,20,100,50,null,"#27c79a",[

                ],"hor"),
            ],"hor",false),
            new FlexibleWidget("hijo2",this,20,200,100,null,"#672caf",[
                new FlexibleWidget("hijo2",this,20,70,50,null,"#8e74ac",[

                ],"hor"),
                new FlexibleWidget("hijo2",this,20,100,50,null,"#89bbad",[

                ],"hor"),
            ],"hor",false),
        ]);
        this.rootWidget=new Widget("papa",this,500,500,"#ff0033",[
            // tmp,
            // new RowWidget("RowWidget",this,"#381971",[
            //     new Widget("RowWidgethijo1",this,20,20,"#47e5f3",[]),
            //     new Widget("RowWidgethijo2",this,40,20,"#d02ab4",[]),
            // ]),
            // new FlexibleWidget("FlexibleWidget",this,400,40,50,30,"#75863a",[
            //     new FlexibleWidget("hijo2",this,20,10,50,100,"#672caf",[
            //         new Widget("RowWidgethijo1",this,50,50,"#47e5f3",[
            //             new Widget("RowWidgethijo1",this,20,20,"#8e1ea1",[]),
            //         ]),
            //     ],"hor"),
            //     new FlexibleWidget("hijo2",this,20,10,50,100,"#9e7dc6",[
            //         new ScrollableWidget("hijo2",this,200,40,"#378da8",[
            //             new Widget("hijo2",this,400,20,"#662ad5",[]),
            //             new Widget("hijo2",this,400,20,"#49aec7",[]),
            //             new Widget("hijo2",this,400,20,"#83b662",[]),
            //             new Widget("hijo2",this,300,20,"#d02698",[]),
            //         ]),
            //         new Widget("hijo2",this,300,20,"#d02698",[]),
            //     ]),
            // ],"hor"),
            w
        ]);
    },
    renderAll:function(){
        //if(!this.treeHasBeenBackConnected){return;}
        this.canvasContext.beginPath();
        this.canvasContext.clearRect(0,0,this.HTMLCanvas.width,this.HTMLCanvas.height);
        this.rootWidget.render(this.canvasContext);
    },
    // connetTreeBackwards:function(){
    //     let queue=[this.rootWidget];
    //     let tmpFather=null;
    //     while(queue.length!=0){
    //         tmpFather=queue.pop();
    //         console.log(tmpFather);
    //         for(let i=0;i<tmpFather.children.length;i++){
    //             tmpFather.children[i].backwardConnect(tmpFather);
    //             queue.push(tmpFather.children[i]);
    //         }
    //     }
    //     this.treeHasBeenBackConnected=true;
    // },
    notificationOnMouseDown:function(e){
        e.innerClientX=e.clientX;
        e.innerClientY=e.clientY;
        e.outterClientX=e.clientX;
        e.outterClientY=e.clientY;
        this.rootWidget.notificationOnMouseDown(e);
    },
    notificationOnMouseUp:function(e){
        e.innerClientX=e.clientX;
        e.innerClientY=e.clientY;
        e.outterClientX=e.clientX;
        e.outterClientY=e.clientY;
        this.rootWidget.notificationOnMouseUp(e);
    },
    notificationOnMouseMove:function(e){
        e.innerClientX=e.clientX;
        e.innerClientY=e.clientY;
        e.outterClientX=e.clientX;
        e.outterClientY=e.clientY;
        this.rootWidget.notificationOnMouseMove(e);
    }
})


let widgetTree=new WidgetTree("c");

window.addEventListener("mousedown",widgetTree.notificationOnMouseDown.bind(widgetTree));
window.addEventListener("mouseup",widgetTree.notificationOnMouseUp.bind(widgetTree));
window.addEventListener("mousemove",widgetTree.notificationOnMouseMove.bind(widgetTree));

window.flag=false;
window.addEventListener("keydown",function(){window.flag=true;})
window.addEventListener("keyup",function(){window.flag=false;})
let perc=10;
setInterval(function(){
    if(flag){
        tmp.parent.setWidth(perc);
        perc++;
    }
},64)