<h1><i class="fa fa-envelope-o"></i> Emailer (AWS SES)</h1>

<div class="row">
    <div class="col-lg-12">
        <blockquote>
            <p>You will need:</p>
            <ol>
                <li>An AWS account</li>
                <li>SES configured for the region nearest your server</li>
                <li>A validated email address or domain in AWS SES</li>
            </ol>

        </blockquote>
    </div>
</div>
<hr />
<form role="form" class="emailer-settings">
    <fieldset>
        <div class="row">
            <div class="col-sm-6">
                <div class="form-group">
                    <label for="accessKeyID">AccessKeyID</label>
                    <input type="text" class="form-control" id="accessKeyID" name="accessKeyID" />
                </div>
            </div>
            <div class="col-sm-6">
                <div class="form-group">
                    <label for="secretAccessKey">SecretAccessKey</label>
                    <input type="text" class="form-control" id="secretAccessKey" name="secretAccessKey" />
                </div>
            </div>
        </div>
        <div class="row">
			<div class="col-sm-6">
				<div class="form-group">
					<label for="region">Region</label>
					<input type="text" class="form-control" id="region" name="region" />
				</div>
			</div>
            <div class="col-sm-6">
                <div class="form-group">
                    <label for="fromAddress">From Address</label>
                    <input type="text" class="form-control" id="fromAddress" name="fromAddress" />
                </div>
            </div>
        </div>
        <div class="row">
			<div class="col-sm12">
				<div class="form-group">
					<label for="subject">Subject</label>
					<input type="text" class="form-control" id="subject" name="subject" />
				</div>
			</div>
        </div>

        <div class="row">
			<div class="col-lg-12">
				<blockquote>
					<p>Add abbreviation to paste data in the letter:</p>
					<ul>
						<li> <b>topicTitle</b>  - title of topic</li>
						<li> <b>postText</b>  - add post text in the letter default first 30 words</li>
					</ul>

				</blockquote>
			</div>
			<div class="col-sm-12">
				<div class="form-group">
					<label for="region">Template</label>
					<textarea id="template" name="template" class="form-control"></textarea>
				</div>
			</div>
        <button class="btn btn-lg btn-primary" id="save" type="button">Save</button>
    </fieldset>
</form>

<script type="text/javascript">
    require(['settings'], function(Settings){
        var form = $('.emailer-settings');
        Settings.load('post-notifier', form);

        $('#save').click(function(event){
            event.preventDefault();
            Settings.save('post-notifier', form, function() {
                app.alert({
                    type: 'success',
                    alert_id: 'post-notifier-saved',
                    title: 'Settings saved',
                    message: 'Click here to reload NodeBB',
                    timeout: 2500,
                    clickfn: function(){
                        socket.emit('admin.reload');
                    }
                });
            });
        });
    });
</script>
