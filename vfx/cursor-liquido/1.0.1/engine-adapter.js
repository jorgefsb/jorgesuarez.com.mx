
(function(root){
  class ApprovedEngineAdapter extends root.FluidCursor {
    constructor(canvas,options){
      const opts=options||{};
      // The baseline uses innerWidth/innerHeight. Make the canvas's CSS box
      // exactly that viewport, including on browsers with a classic scrollbar.
      canvas.style.width='100vw';canvas.style.height='100vh';
      super(canvas,Object.assign({},opts,{play:'off'}));
      if(this.playObserver)this.playObserver.disconnect();
      this.setRadius(opts.radius||0);
    }
    setRadius(radius){return this.setPlay(radius<=0?'off':radius>=18?'full':'subtle');}
  }
  root.FluidEngine=ApprovedEngineAdapter;
})(window);
