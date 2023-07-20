<script>
	import 'papercss/dist/paper.min.css';
	import { Select, Input } from 'spaper';

	let kind = 'ccc.demo-test.v1';
	let targetLevel = 'Global';
	let inheriedFrom = '<none>';
	let token = '';
  let businessUnitGroupId = '';
	let businessUnitId = '';
	let workstationId = '';

	$: valueSubUrl = (() => {
		switch (targetLevel) {
			case 'Global':
				return `default`;
			case 'Tenant':
				return `tenant`;
      case 'Business Unit Group':
        return `business-unit-groups/${businessUnitGroupId}`
			case 'Business Unit':
				return `business-units/${businessUnitId}`;
			case 'Workstation':
				return `business-units/${businessUnitId}/workstations/${workstationId}`;
		}
	})();

	$: valueUrl = `https://ccc-api.retailsvc.com/api/v1/config/${kind}/values/${valueSubUrl}`;

	$: valueLoader = fetch('https://corsproxy.io/?' + encodeURIComponent(valueUrl), {
		headers: { Authorization: `Bearer ${token}` }
	}).then(async (res) => {
		if (!res.ok) {
			throw new Error('response status = ' + res.status);
		}

		const data = await res.json();
		inheriedFrom = data.inheritedFrom;
		return data.value;
	});
</script>

<div style="margin: 4px">
	<div class="row">
		<div class="col">
			<Input placeholder="..." label="Token" bind:value={token} />
		</div>
		<div class="col">
			<Select label="Kind" bind:value={kind}>
				<option>ccc.demo-test.v1</option>
				<option>che.receipt-layout.v1</option>
			</Select>
		</div>
		<div class="col">
			<Select label="Target Level" bind:value={targetLevel}>
				<option>Global</option>
				<option>Tenant</option>
        <option>Business Unit Group</option>
				<option>Business Unit</option>
				<option>Workstation</option>
			</Select>
		</div>
		{#if targetLevel === 'Business Unit Group'}
			<div class="col">
				<Input placeholder="..." label="Business Unit Group ID" bind:value={businessUnitGroupId} />
			</div>
		{/if}
		{#if targetLevel === 'Business Unit'}
			<div class="col">
				<Input placeholder="..." label="Business Unit ID" bind:value={businessUnitId} />
			</div>
		{/if}
		{#if targetLevel === 'Workstation'}
			<div class="col">
				<Input placeholder="..." label="Business Unit ID" bind:value={businessUnitId} />
			</div>
			<div class="col">
				<Input placeholder="..." label="Workstation ID" bind:value={workstationId} />
			</div>
		{/if}
	</div>

	<div style="margin: 24px">
		<p>URL: {valueUrl}</p>
		<p>Inherited from: {inheriedFrom}</p>

		{#await valueLoader}
			Loading...
		{:then value}
			<textarea style="width: 100%; height: 200px">{JSON.stringify(value, null, 2)}</textarea>
		{:catch error}
			{error}
		{/await}
	</div>
</div>
