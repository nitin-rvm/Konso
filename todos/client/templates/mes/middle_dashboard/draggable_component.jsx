ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

Draggable = React.createClass({
  getInitialState: function () {
    return {
      posX: this.props.initialPos['x'],
      posY: this.props.initialPos['y'],
      dragging: false,
      rel: null, // position relative to the cursor
      grab: false
    }
  },

  componentDidUpdate: function (props, state) {
    if (this.state.dragging && !state.dragging) {
      document.addEventListener('mousemove', this.onMouseMove)
      document.addEventListener('mouseup', this.onMouseUp)
    } else if (!this.state.dragging && state.dragging) {
      document.removeEventListener('mousemove', this.onMouseMove)
      document.removeEventListener('mouseup', this.onMouseUp)
    }
  },

  onMouseDown: function (element) {
    if (element.button !== 0) return
    var pos = $(this.getDOMNode()).offset()

    this.setState({
      dragging: true,
      rel: {
        x: pos.left,
        y: pos.top
      },
      grab:true
    })
    element.stopPropagation()
    element.preventDefault()
  },
  onMouseUp: function (element) {
    this.setState({dragging: false, grab:false})
    element.stopPropagation()
    element.preventDefault()
    this.changeHandler();
  },
  onMouseMove: function (element) {
    if (!this.state.dragging) return
    if (!this.props.is_auth_for_moving) return
    var pos = $(this.getDOMNode()).parent().offset()
    if (element.pageX >= (pos.left + 50)) {
      this.setState({ posX:element.pageX - pos.left - 50 })
    }
    if (element.pageY >= (pos.top + 75)) {
      this.setState({ posY: element.pageY - pos.top - 50 })
    };
    element.stopPropagation()
    element.preventDefault()
  },
  changeHandler: function(){
    this.props.onChange(this.state.posX,this.state.posY)
  },

  mouseOver : function(){
    this.props.over(this.state.posX,this.state.posY)
  },

  render: function () {
    return (
      <ReactCSSTransitionGroup transitionName="example" transitionAppear={true} transitionAppearTimeout={1000}>
        <div className={this.props.do_flash ? "blink draggable" : "draggable"} style = {{"cursor":(this.state.grab ? 'move' : ''), "backgroundColor":this.props.colour, "left": this.state.posX + 'px',"top": this.state.posY + 'px'}} onMouseDown = {this.onMouseDown} onMouseOver={this.mouseOver} onMouseOut={this.props.out}>
          <p className="bx_txt_cntr">{this.props.data_attr}</p>
        </div>
      </ReactCSSTransitionGroup>
    )
  }
});
