/* Recover real queued input across adaptive quality reduction only. */
(function(root){
  class QualitySafeAdapter extends root.FluidEngine {
    watchBudget(ms){
      const wasReduced=this.qualityReduced;
      const pending=this.pending, pointer=this.pointer;
      const width=this.width, height=this.height;
      const keepRunning=super.watchBudget(ms);
      // Never retain fields, resize input, cancellation or the hard budget stop.
      if(keepRunning && !wasReduced && this.qualityReduced && pending &&
          this.gl && !this.destroyed && !this.lost && !this.media.matches &&
          this.play!=='off' && this.width===width && this.height===height){
        this.pending=pending;
        this.pointer=pointer;
      }
      return keepRunning;
    }
  }
  root.FluidEngine=QualitySafeAdapter;
})(window);
