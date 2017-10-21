<style>
	.pagging {
		text-align: right;
		font-weight: bold;
	}
	.footer {
		border-top: 1pt solid black;
		vertical-align: middle;
	}
</style>
<table class="footer" cellpadding="3">
	<tr>
		<td colspan="4">https://verejne.digital/obstaravanieFirma?ico={$data['company']['ico']}</td>
		<td class="pagging">{$currentPage}/{$pages}</td>
	</tr>
</table>
