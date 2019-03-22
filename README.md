# SVG Image Tracer

This is a tool for drawing SVGs by tracing over raster images.

- [ ] Add CSS with animation to source code copy depending on the value of the animation checkbox
- [ ] Consider offsetting all points by .5 to snap the to pixels (using `viewBox` or recalculating them on the fly)
- [ ] Add an option of setting path animation props individually (using CSS vars on the `polyline`s directly)
- [ ] Add another option to animation delay which would be "after previous" and default to be able to cascade paths
- [ ] Add canvas zooming controls for precision work in details
- [ ] Fix canvas not clearing after popping points
- [ ] Implement splitting paths
- [ ] Add a check for auto closing the current path
- [ ] Test and fix multipath issues
